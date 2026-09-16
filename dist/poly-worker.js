importScripts('assets/poly/delaunator.min.js', 'poly-engine.js');
self.onmessage = ({data}) => {
  try { self.postMessage({svg:ShiyuPolyEngine.convert(data)}); }
  catch(error) { self.postMessage({error:error.message}); }
};
