
/**
*
* UDUK Util 1.0
*
*/

var UdukUtil = {

  id: "utilities 1.0",

  unique: function(arr)
  {
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
      var val = arr[i];
      var c = 0;
      ret.push(val);
      for (var j = 0; j < ret.length; j++) {
        if (val == ret[j]) {
          c++;
        }
        if (c > 1) {
          ret.pop(val)
        }
      }
    }
    return ret;
  },

  compare: function(arr1, arr2)
  {
    return JSON.stringify(arr1) == JSON.stringify(arr2);
  },

  isExist: function(key, set)
  {
    var len = set.length;
    var ret = false;
    for (var i = 0; i < len; i++) {
      c = this.compare(key, set[i]);
      if (c) {
        ret = true;
      }
    }
    return ret;
  },

  diff: function(arr1, arr2)
  {
    var diff = [];
    var len = arr2.length;
    if (arr1.length == arr2.length) {
      for (var i = 0; i < len; i++) {
        diff.push(arr2[i] - arr1[i]);	
      }
    }
    return diff;
  },

  partition: function(arr, n)
  {
    var set = [];
    var idx = 1;
    if (arr.length > n) {
      for (var i = 0; i < arr.length; i+=n, idx++) {
       var a = arr.slice(i, n * idx);
       set.push(a);
      }
    }
    return set;
  },

  chunk: function(arr)
  {
    var len = arr.length;
    var z = 3
    var set = [];
    if (len < 6) {
      return false;
    }
    do {
      var h = [];
      for (var i = 0; i <= len - z; i++) {
          h.push(arr.slice(i, z + i));
      }
      set.push(h);
      z++;
    } while (z <= (len - 1));

    return set;
  },
  
  ngram: function(arr, z)
  {
    var n = [];
    for (var i = 0; i <= arr.length - z; i++) {
      n.push(arr.slice(i, z + i));
    }
    return n;
  },

  freqCount: function(arr)
  {
    var uniq = this.unique(arr);
    var freq = [];
    var ret = [];
    for (var z = 0; z < uniq.length; z++) {
      freq.push(0);
    }
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < uniq.length; j++) {
        if (arr[i] == uniq[j]) {
          freq[j] += 1;
        }
      }
    }
    ret.push(uniq); ret.push(freq);
    return ret;
  },

  mapIdx: function(arrIdx, arrOrg)
  {
    var s = 0;
    var e = 0;
    var set = [];
    for (var i = 0; i < arrIdx.length; i++) {
      s = e;
      e = arrIdx[i] + 1;
      set.push(arrOrg.slice(s, e));
    }
    s = e;
    set.push(arrOrg.slice(s, arrOrg.length));
    return set;
  }
 
};
