export type Campaign = {
  id: string; name: string; start: string; end: string; newUserDays: number; purchaseWithinDays: number;
  inviterDays: number; weeklyCap: number | null; monthlyCap: number | null;
  stoppedAt?: string; createdAt: string; operator: string;
}
export type Reward = {
  id: string; campaignId: string; campaignName: string; type: '注册奖励' | '付费奖励'; occurredAt: string;
  settledAt: string; inviterId: string; inviterName: string; inviteeId: string; inviteeName: string;
  inviterDays: number; inviteeDays: number; requestedDays: number; note: string; orderId?: string;
}
export type RewardUser = {
  id: string; name: string; registeredAt: string; blacklisted: boolean;
  invitation?: { campaignId: string; inviterId: string };
  memberEvents: { id?: string; time: string; type: string; amount: number }[];
}
export declare const DAY: number;
export declare function timestamp(value:string):number;
export declare function campaignStatus(c:Campaign,now?:number):string;
export declare function validateCampaign(c:Campaign,all:Campaign[],now?:number):void;
export declare function calculateRewards(campaigns:Campaign[],users:RewardUser[],existing:Reward[],now?:number):Reward[];
