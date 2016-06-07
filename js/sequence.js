
/**
*
* UDUK Sequence 1.0
*
*/

var UdukSequence = {

  id: "sequence 1.0",

  toInterval: function(sequence)
  {
    var n = 1;
    var p = 0;
    var interval = [];
    for (var i = 0; i < sequence.length - 1; i++, n++, p++) {
      var splitP = this.splitNote(sequence[p]);
      var splitN = this.splitNote(sequence[n]);
      var senarP = splitP[0];
      var fretP = splitP[1];
      var senarN = splitN[0];
      var fretN = splitN[1];
      
      var dist = (senarN - senarP);
      if (dist == 0) {
        var itv = fretN - fretP;
        interval.push(itv);		
      }
      else if (dist > 0) {
        if (senarP == 2 && senarN == 3) {
          var itv = (4 * dist) - (fretN - fretP);
          interval.push(itv);  
        }
        else {
          var itv = (5 * dist) - (fretN - fretP);
          interval.push(itv);  
        }
      }
      else if (dist < 0) {
        if (senarP == 3 && senarN == 2) {
          var itv = (-4 * dist) + (fretN - fretP);
          interval.push(itv);  
        }
        else {  
          var itv = (-5 * dist) + (fretN - fretP);
          interval.push(itv);  
        }
      }
    }
    return interval;
  },

  toMIDI: function (sequence) 
  {
    var buildSequence = [];
    for (var i = 0; i < sequence.length; i++) {
      var s = this.splitNote(sequence[i]);
      buildSequence.push(this.toMIDINote(s[0], s[1]));
    }
    return buildSequence; 
  },

  toMIDINote: function(s, f) 
  {
    var six   = [ "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4"];
    var five  = [ "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4"];
    var four  = [ "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5"];
    var three = [ "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5"];
    var two   = [ "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"];
    var one   = [ "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5", "C6", "C#6", "D6", "D#6", "E6"];

    var midiNoteTable = [];
        midiNoteTable.push(["0"]);
        midiNoteTable.push(one); 
        midiNoteTable.push(two);
        midiNoteTable.push(three);
        midiNoteTable.push(four);
        midiNoteTable.push(five);
        midiNoteTable.push(six);

    s = parseInt(s);
    f = parseInt(f);
    return midiNoteTable[s][f];
  },

  toFretNote: function(str, scale)
  {
    var six   = [ "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"];
    var five  = [ "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A"];
    var four  = [ "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D"];
    var three = [ "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G"];
    var two   = [ "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    var one   = [ "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"];

    var fretNoteTable = [];
        fretNoteTable.push(["0"]);
        fretNoteTable.push(one); 
        fretNoteTable.push(two);
        fretNoteTable.push(three);
        fretNoteTable.push(four);
        fretNoteTable.push(five);
        fretNoteTable.push(six);

    var ret = [];
    for (var i = 0; i < scale.length; i++) {
      var note = scale[i].toUpperCase();
      if (note == "GB") {
        note = "F#";
      }
      else if (note == "AB") {
        note = "G#";
      }
      else if (note == "BB") {
        note = "A#";
      }
      else if (note == "DB") {
        note = "C#";
      }
      for (var j = 0; j < fretNoteTable[str].length; j++) {
        if (note == fretNoteTable[str][j]) {
          if ( j >= 0 && j < 10 ) {
            ret.push(str + "0" + j);
          }
          else if ( j >= 10 && j <= 24 ) {
            ret.push(str + "" + j);
          }
        }

      }
    }
    return ret;
  },

  filterScale: function(sequence, scale) 
  {
    var ret = [];
    for (var i = 0; i < scale.length; i++) {
      scale[i] = scale[i].toUpperCase();
    }
    var buildScale = [];
    for (var i = 1; i <= 6; i++) {
      buildScale.push(this.toFretNote(i, scale));
    }
    for (var iii = 0; iii < sequence.length; iii++) {
      for (var x = 0; x < buildScale.length; x++) {
        for (var y = 0; y < buildScale[x].length; y++) {
          if (parseInt(sequence[iii]) == parseInt(buildScale[x][y])) {
            ret.push(sequence[iii]);
          }
        }
      }
    }
    return ret;
  },

  filterDuplicate: function(sequence) 
  {
    var ret = [];
    for (var i = 0; i < sequence.length; i++) {
      if(sequence[i] != sequence[i+1]) {
        ret.push(sequence[i]);
      }
    }
    return ret;
  },

  splitNote: function(note)
  {
    var x = note.toString();
    var root = x.charAt(0).toString();
    var two = x.substr(1, 2).toString();
    var z = two.charAt(0).toString();
    var subroot = "";

    if (parseInt(z) == 0) {
      subroot = two.charAt(1);
    } else {
      subroot = two;
    }
    return [root, subroot];
  },

  splitByString: function(sequence)
  {
    var stringSequence = []; 
    var skipIdx = [];

    for (var i = 0; i < sequence.length; i++) {
      var noteArray = this.splitNote(sequence[i]);
      var senar = parseInt(noteArray[0]);
      var note = parseInt(noteArray[1]);
      stringSequence.push(senar);
    }

    var n = 1;
    var p = 0;
    for (var i = 0; i < stringSequence.length - 1; i++, n++, p++) {
      var y = stringSequence[n] - stringSequence[p];
      if(y != 0) {
        skipIdx.push(i);
      }
    }
    return skipIdx;
  },

  fundamentalFlow: function(note)
  {
    // must be decomposed minimally
    var ff = [];
    var min = Math.min(... seq);
    var max = Math.max(... seq);
    ff.push(min);
    ff.push(max);
    return ff;
  },

  spin: function(sequence)
  {
    var len = sequence.length;
    var tmp = sequence;
    var i = len - 1;
    var spin = [];
    spin.push(tmp);

    do {
      var newSpin = [];
      newSpin.push(tmp[tmp.length - 1]);

      for (var j = 0; j < len - 1; j++) {
        newSpin.push(tmp[j]);
      }

      tmp = newSpin;
      spin.push (tmp);

      i--; 
    } while (i > 0);

    return spin;
  },

  fPosition: function(sequence)
  {
    var fretSize = 24;
    var itv = this.toInterval(sequence);

    var fret = [];
    for (var z = 0; z <= fretSize; z++) {
      fret.push(0);
    }

    var pointer = this.splitNote(sequence[0]);
    var c = parseInt(pointer[1]);
    var min = 0;
    var max = 0;

    fret[c]++;
    min = max = c;

    for (var i = 0; i < itv.length; i++) {
      c += itv[i]; 
      (c < min) ? min = c : min = min;
      (c > max) ? max = c : max = max;
      fret[c]++;
    }

    var fpos = fret.slice(min, max + 1);
    for (var j = 0; j < fpos.length; j++) {
      if (fpos[j] != 0) {
        fpos[j] = fpos[j] / fpos[j];
      }
    }

    return fpos;
  },

  fGap: function(fpos)
  {
    var count = 0;
    for (var i = 0; i < fpos.length; i++) {
      if (fpos[i] == 0) {
        count += 1;
      }
    }
    return count;
  }

};
