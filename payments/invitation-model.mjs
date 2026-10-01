export const DAY = 86400000;
export function timestamp(value) {
    if (/Z$|[+-]\d\d:\d\d$/.test(value))
        return Date.parse(value);
    const parts = value.match(/\d+/g)?.map(Number);
    if (!parts || parts.length < 3)
        return NaN;
    return Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0) - 8 * 3600000;
}
export function campaignStatus(c, now = Date.now()) {
    return c.stoppedAt ? '已停用' : now < timestamp(c.start) ? '未开始' : now >= timestamp(c.end) ? '已结束' : '进行中';
}
export function validateCampaign(c, all, now = Date.now()) {
    if (!c.name.trim() || c.name.length > 60)
        throw Error('请填写 1–60 字的活动名称');
    if (!Number.isFinite(timestamp(c.start)) || !Number.isFinite(timestamp(c.end)) || timestamp(c.start) >= timestamp(c.end))
        throw Error('请选择完整有效期，结束时间必须晚于开始时间');
    if (timestamp(c.start) < Math.floor((now + 8 * 3600000) / DAY) * DAY - 8 * 3600000)
        throw Error('开始日期不能早于今天');
    for (const [label, value, minimum] of [['新用户奖励', c.newUserDays, 0], ['邀请注册奖励', c.registrationInviterDays ?? 0, 0], ['邀请方奖励', c.inviterDays, 0], ['首次付费期限', c.purchaseWithinDays, 1], ['每周上限', c.weeklyCap, 0], ['每月上限', c.monthlyCap, 0]]) {
        const unlimited = (label === '每周上限' || label === '每月上限') && value === null;
        if (!unlimited && (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum || value > 36500))
            throw Error(`${label}需为 ${minimum}–36500 的整数`);
    }
    if (all.some(x => x.id !== c.id && !x.stoppedAt && timestamp(c.start) < timestamp(x.end) && timestamp(c.end) > timestamp(x.start)))
        throw Error('活动有效期与其他未停用活动重叠，请调整时间或先停用原活动');
}
function period(at, weekly) {
    const date = new Date(at + 8 * 3600000);
    date.setUTCHours(0, 0, 0, 0);
    if (weekly)
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    else
        date.setUTCDate(1);
    return date.getTime() - 8 * 3600000;
}
// Derive immutable, idempotent rewards from server-owned registration and paid membership events.
export function calculateRewards(campaigns, users, existing, now = Date.now()) {
    const candidates = [];
    for (const user of users) {
        const c = campaigns.find(x => x.id === user.invitation?.campaignId);
        const inviter = users.find(x => x.id === user.invitation?.inviterId);
        if (!c || !inviter || inviter.id === user.id)
            continue;
        const registered = timestamp(user.registeredAt);
        const end = Math.min(timestamp(c.end), c.stoppedAt ? timestamp(c.stoppedAt) : Infinity);
        if (!(registered >= timestamp(c.start) && registered < end && registered <= now))
            continue;
        candidates.push({ c, inviter, user, at: registered, type: '注册奖励' });
        const firstPaid = user.memberEvents.filter(e => e.type === '付费' && e.amount > 0).sort((a, b) => timestamp(a.time) - timestamp(b.time))[0];
        if (firstPaid && firstPaid.invitationEligible !== false) {
            const at = timestamp(firstPaid.time);
            if (at >= registered && at < end && at <= now && at <= registered + c.purchaseWithinDays * DAY)
                candidates.push({ c, inviter, user, at, type: '付费奖励', orderId: firstPaid.orderId || firstPaid.id });
        }
    }
    const result = [...existing];
    for (const event of candidates.sort((a, b) => a.at - b.at || a.user.id.localeCompare(b.user.id) || a.type.localeCompare(b.type))) {
        const { c, inviter, user, at, type } = event;
        const id = `${c.id}:${user.id}:${type}`;
        if (result.some(x => x.id === id))
            continue;
        const grant = (recipient, requested) => {
            const used = weekly => result.filter(x => timestamp(x.occurredAt) >= period(at, weekly) && timestamp(x.occurredAt) <= at).reduce((sum,x)=>sum+(x.inviterId===recipient.id?x.inviterDays:0)+(x.inviteeId===recipient.id?x.inviteeDays:0),0);
            const days=recipient.blacklisted?0:Math.max(0,Math.min(requested,c.weeklyCap===null?Infinity:c.weeklyCap-used(true),c.monthlyCap===null?Infinity:c.monthlyCap-used(false)));
            return {requested,days,note:recipient.blacklisted?'账号已拉黑，未发放':days<requested?'达到奖励上限':requested===0?'未配置奖励':'已发放'};
        };
        const a=grant(inviter,type==='注册奖励'?(c.registrationInviterDays??0):c.inviterDays), b=grant(user,type==='注册奖励'?c.newUserDays:0);
        result.push({id,campaignId:c.id,campaignName:c.name,type,occurredAt:new Date(at).toISOString(),settledAt:new Date(now).toISOString(),inviterId:inviter.id,inviterName:inviter.name,inviteeId:user.id,inviteeName:user.name,inviterDays:a.days,inviteeDays:b.days,requestedDays:a.requested+b.requested,requestedInviterDays:a.requested,requestedInviteeDays:b.requested,note:'邀请人：'+a.note+'；被邀请人：'+b.note,orderId:event.orderId});
    }
    return result;
}
