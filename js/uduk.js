/*

o   o o-o   o   o o  o 
|   | |  \  |   | | /  
|   | |   O |   | OO   
|   | |  /  |   | | \  
 o-o  o-o    o-o  o  o  Zhred v1.0

*/

var f = UdukFretboard6(100, 120, ["e", "B", "G", "D", "A", "E"]);

var ZhredMIDI = false;
var ZhredCanvas_Line, ZhredCanvas_Lines = [], ZhredCanvas_Circles = [], ZhredCanvas_Notes =[];
var ZhredCanvas_Raster, ZhredCanvas_Block;

var ZhredCanvas_X;
var ZhredCanvas_Y;
var ZhredCanvas_Rects = [];

var content = "zhredBoard | klik dan geser / click and drag / cliquer et faire glisser / クリックしてドラッグ / 클릭하고 드래그";

var ZhredCanvas_TextItem = new PointText({
  content: content,
  point: new Point(20, 40),
  fillColor: '#c7c7c7',
});

var ZhredSequence_HitNote = [];
var ZhredSequence_Save;

var ToneJS_Synth_L; 
var ToneJS_Synth_R; 

var ToneJS_Metronome_Snare;
var ToneJS_Metronome_SnarePart;

var ToneJS_Pattern_Pattern;
var ToneJS_Play_Sequence;

function clearDots() {
  for (var i = 0; i < ZhredCanvas_Notes.length; i++) {
    ZhredCanvas_Notes[i].remove();
  }
  ZhredCanvas_Notes.splice(0, ZhredCanvas_Notes.length);
}

function clearAllCanvas() {
  ZhredCanvas_TextItem.content = content;
  document.getElementById("ngram").value = "";

  for (var i = 0; i < ZhredCanvas_Circles.length; i++) {
    ZhredCanvas_Circles[i].remove();
  }
  for (var i = 0; i < ZhredCanvas_Lines.length; i++) {
    ZhredCanvas_Lines[i].remove();
  }
  for (var i = 0; i < ZhredCanvas_Rects.length; i++) {
    ZhredCanvas_Rects[i].remove();
  }
  
  ZhredSequence_HitNote.splice(0, ZhredSequence_HitNote.length);
  ZhredCanvas_Lines.splice(0, ZhredCanvas_Lines.length);
  ZhredCanvas_Circles.splice(0, ZhredCanvas_Circles.length);
  ZhredCanvas_Rects.splice(0, ZhredCanvas_Rects.length);
 
  clearDots();

  $("#ngram").css("background-color", "#fff");

  if (ToneJS_Play_Sequence) {
    Tone.Transport.stop();
    try {
      ToneJS_Play_Sequence.dispose();
      ToneJS_Play_Sequence.removeAll();
    } catch (e) { }
    delete ToneJS_Play_Sequence;
  }

  if (ToneJS_Metronome_Snare || ToneJS_Metronome_SnarePart) {
    Tone.Transport.stop();
    try {
      ToneJS_Metronome_Snare.dispose();
      ToneJS_Metronome_SnarePart.dispose();
    } catch (e) { }
    delete ToneJS_Metronome_Snare;
    delete ToneJS_Metronome_SnarePart;
  }
  
  if (ZhredCanvas_Raster) {
    ZhredCanvas_Raster.remove();
    delete ZhredCanvas_Raster;
  }
}

function onMouseDown(event) {
  if (checkCanvasBoundary(event) && event.modifiers.shift == false) { 
    var x = getHitNote(event);
    ZhredCanvas_TextItem.content = 'position: ' + event.point;
    cDown = new Path.Circle({
      center: event.point,
      radius: 8
    });
    cDown.strokeColor = 'black';
    cDown.fillColor = 'white';
    cDown.opacity = 0.7;
    ZhredCanvas_Circles.push(cDown);

    ZhredCanvas_Line = new Path();
    ZhredCanvas_Line.strokeColor = 'black';
    ZhredCanvas_Line.strokeWidth = 12;
    ZhredCanvas_Line.opacity = 0.4;
    ZhredCanvas_Lines.push(ZhredCanvas_Line);
    
    var r = UdukSequence.splitNote(x);
    ToneJS_Synth_R.triggerAttackRelease(UdukSequence.toMIDINote(r[0], r[1]), "16n");
  }
  else if (checkCanvasBoundary(event) && event.modifiers.shift) {
    ZhredCanvas_X = event.point.x;
    ZhredCanvas_Y = event.point.y;
    var topLeft = new Point(ZhredCanvas_X, ZhredCanvas_Y);
    var rectSize = new Size(0, 0);
    var rectangle = new Rectangle(topLeft, rectSize);
    var path = new Path.Rectangle(rectangle);
    path.fillColor = 'black';
    path.opacity = 0.4;
    ZhredCanvas_Rects.push(path); 
  }
}

function onMouseDrag(event) {
  if (checkCanvasBoundary(event) && event.modifiers.shift == false) { 
    getHitNote(event);
    ZhredCanvas_TextItem.content = 'position: ' + event.point;
    ZhredCanvas_Line.add(event.point);
  }
  else if (checkCanvasBoundary(event) && event.modifiers.shift) { 
    var from = new Point(ZhredCanvas_X, ZhredCanvas_Y);
    var to = new Point(event.point.x, event.point.y);
    var r = new Rectangle(from, to);
    var p = new Path.Rectangle(r);
    p.fillColor = 'black';
    p.opacity = 0.4;
    ZhredCanvas_Rects.push(p);

    for (var i = 0; i < ZhredCanvas_Rects.length - 1; i++) {
      ZhredCanvas_Rects[i].remove();
    }
  }

}

function onMouseUp(event) {
  if (checkCanvasBoundary(event) && event.modifiers.shift == false) { 
    ZhredCanvas_TextItem.content = 'position: ' + event.point;
    cUp = new Path.Circle({
      center: event.point,
      radius: 8
    });
    cUp.strokeColor = 'black';
    cUp.fillColor = 'orange';
    cUp.opacity = 0.7;
    ZhredCanvas_Circles.push(cUp);
  }
}

function checkCanvasBoundary(event) {
  var thresholdX = 20;
  var thresholdY = 10;
  if ( (event.point.x >= 80 && event.point.x < 1040 + thresholdX) && (event.point.y >= 120-thresholdY  && event.point.y <= 270+thresholdY) ) {
    return true;
  } else {
    return false;
  }
}

function getHitNote(event) {
 var ret;
  var ss = Math.round ((event.point.y + 30 - f[1]) / 30); 
  var ff = Math.round ((event.point.x - f[0] - 20 + 40) / 40); 
  if(ff >= 0 && ff < 10) {
    var z = ss + "0" + ff;
    ZhredSequence_HitNote.push(z);
    ret = z;
  }
  else {
    var z = ss + "" + ff;
    ZhredSequence_HitNote.push(z);
    ret = z;
  }
  return ret;
}

function initializeToneJS() {
  var merge = new Tone.Merge();

  var reverb = new Tone.Freeverb({
    "roomSize" : 0.2,
    "wet" : 0.3
  });

  merge.chain(reverb, Tone.Master);

  var synthSettings = {
    "oscillator": {
    "detune": 0,
    "type": "custom",
    "partials" : [2, 1, 2, 2],
    "phase": 0,
    "volume": 0
  },
    "envelope": {
    "attack": 0.005,
    "decay": 0.3,
    "sustain": 0.2,
    "release": 1,
  },
    "portamento": 0.01,
    "volume": -20
  };

  ToneJS_Synth_L = new Tone.SimpleSynth(synthSettings).connect(merge.left);
  ToneJS_Synth_R = new Tone.SimpleSynth(synthSettings).connect(merge.right);

  /*
  var distortion = new Tone.Distortion(0.3).toMaster();
  synthL.connect(distortion);
  synthR.connect(distortion);

  var feedbackDelay = new Tone.FeedbackDelay("8n", 0.2).toMaster();
  synthL.connect(feedbackDelay);
  synthR.connect(feedbackDelay);
  */
}

function playMetronome(tempo) {
  Tone.Transport.timeSignature = [4, 4];
  Tone.Transport.bpm.value = tempo;
  Tone.Transport.PPQ.value = 96;

  ToneJS_Metronome_Snare = new Tone.NoiseSynth({
    "volume" : -12,
    "envelope" : {
    "attack" : 0.001,
    "decay" : 0.2,
    "sustain" : 0
    },
    "filterEnvelope" : {
    "attack" : 0.001,
    "decay" : 0.1,
    "sustain" : 0
    }
  }).toMaster();
  ToneJS_Metronome_SnarePart = new Tone.Loop(function(time){
    ToneJS_Metronome_Snare.triggerAttack(time);
  }, "4n").start();

  Tone.Transport.start();
}

function playAutoPilot() {
  Tone.Transport.timeSignature = [4, 4];
  Tone.Transport.bpm.value = Math.floor(Math.random() * (181 - 160)) + 160;
  Tone.Transport.PPQ.value = 96;
  
  if (ZhredSequence_HitNote.length >= 5) {
    var uniqueProcessed = UdukUtil.unique(ZhredSequence_HitNote);
    var seqReady = UdukSequence.toMIDI(ZhredSequence_HitNote);

    seqReady = seqReady.sort();
    seqReady = seqReady.slice(0, ZhredSequence_HitNote.length + 1);

    var rndIndex = Math.floor(Math.random() * 7);
    var pattern = ["upDown", "downUp", "alternateUp", "alternateDown", "random", "randomWalk", "randomOnce"];

    ToneJS_Pattern_Pattern = new Tone.Pattern(function(time, note){
      ToneJS_Synth_L.triggerAttackRelease(note, "8n", time);
      ToneJS_Synth_R.triggerAttackRelease(note, "8n", time);
    },seqReady, pattern[rndIndex]).start();
    ToneJS_Pattern_Pattern.humanize = true;
  }

  else {
    var patternSeq = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
    ToneJS_Pattern_Pattern = new Tone.Pattern(function(time, note){
      ToneJS_Synth_L.triggerAttackRelease(note, "8n", time);
      ToneJS_Synth_R.triggerAttackRelease(note, "8n", time);
    },patternSeq, "randomWalk").start();
    ToneJS_Pattern_Pattern.humanize = true;
  }

  Tone.Transport.start();
}

function playToneJS(sequence, tempo) {
  if (!ZhredMIDI) {
    Tone.Transport.timeSignature = [4, 4];
    Tone.Transport.bpm.value = tempo;
    Tone.Transport.PPQ.value = 96;

    ToneJS_Play_Sequence = new Tone.Sequence(function(time, note){
      ToneJS_Synth_L.triggerAttackRelease(note, "16n", time);
      ToneJS_Synth_R.triggerAttackRelease(note, "16n", time);
    },sequence, "16n").start();

    ToneJS_Play_Sequence.loop = false;
    ToneJS_Play_Sequence.humanize = true;

    Tone.Transport.start();
  }
  else {
    var tone = new Tone();
    var zequence = [];
    var t = UdukMIDI.restTiming(tempo);

    for (var i = 0; i < sequence.length; i++) {
      zequence.push(tone.noteToMidi(sequence[i]));
    }
    UdukMIDI.playSequence(zequence, t['sixteenN']); 
  }
}

function ngramProcessingChromatic(sequence, size, scale) {
  var ret = [];
  var n = UdukUtil.ngram(sequence, size);
  for (var i = 0; i < n.length; i++) {
    for (var j = 0; j < n[i].length; j++) {
      ret.push(n[i][j]);
    }
  }
  return ret;
}

function ngramProcessingScale(sequence, size, scale) {
  var ret = [];
  var buildSeq = UdukSequence.filterScale(sequence, scale);
  var n = UdukUtil.ngram(buildSeq, size);
  for (var i = 0; i < n.length; i++) {
    for (var j = 0; j < n[i].length; j++) {
      ret.push(n[i][j]);
    }
  }
  return ret;
}

function saveSequence(sequence, tempo) {
  ZhredSequence_Save = "";
  ZhredSequence_Save = tempo 
  ZhredSequence_Save += "|";
  ZhredSequence_Save += sequence.slice(0, sequence.length);
}

function playZhred() {
  var ngram = document.getElementById('ngram').value;
 
  if (ngram == "" || ngram.length == 0) {
    var uniqueSeq = UdukUtil.unique(ZhredSequence_HitNote);
    saveSequence(uniqueSeq, 180);

    clearDots();
    for (var i = 0; i < uniqueSeq.length; i++) {
      var d = drawSeq6(f, uniqueSeq[i], "c");
      ZhredCanvas_Notes.push(d);
    }
    var seqReady = UdukSequence.toMIDI(uniqueSeq);
    playToneJS(seqReady, 180);
  }

  else if (ngram.match(/metronome\s*\d{3}/g)) {
    var input = ngram.split(" ");
    var tempo = parseInt(input[1]);
    if (tempo >= 100 && tempo <= 240) {
      playMetronome(tempo);
    }
  }

  else if (ngram.match(/batik\s*\d{3}/g)) {
    var input = ngram.split(" ");
    var tempo = parseInt(input[1]);
    if (tempo >= 100 && tempo <= 240) {
      var filtered = UdukSequence.filterDuplicate(ZhredSequence_HitNote);
      saveSequence(filtered, tempo);

      clearDots();
      var uniqueProcessed = UdukUtil.unique(filtered);
      for (var i = 0; i < uniqueProcessed.length; i++) {
        var d = drawSeq6(f, uniqueProcessed[i], "b");
        ZhredCanvas_Notes.push(d);
      }

      var seqReady = UdukSequence.toMIDI(filtered);
      playToneJS(seqReady, tempo);
    }
  }
  else if (ngram.match(/\d{1} [\174] chromatic [\174] \d{3}/g))
  {
    var input = ngram.split("|");
    var size = parseInt(input[0]);
    var scale = input[1];
    var tempo = parseInt(input[2]);
    var filtered = UdukSequence.filterDuplicate(ZhredSequence_HitNote);
    var processed = ngramProcessingChromatic(filtered, size, scale);
    saveSequence(processed, tempo);

    clearDots();
    var uniqueProcessed = UdukUtil.unique(processed);
    for (var i = 0; i < uniqueProcessed.length; i++) {
      var d = drawSeq6(f, uniqueProcessed[i], "nc");
      ZhredCanvas_Notes.push(d);
    }

    var seqReady = UdukSequence.toMIDI(processed);
    playToneJS(seqReady, tempo);
  }
  else if (ngram.match(/\d{1} [a-zA-Z 0-9\#\,\|]* \d{3}/g))
  {
    var input = ngram.split("|");
    var size = parseInt(input[0]);
    var scale = input[1].replace(/ /g,'');
    var scales = scale.split(",");
    var tempo = parseInt(input[2]);
    if (scales.length > 2) {
      var filtered = UdukSequence.filterDuplicate(ZhredSequence_HitNote);
      var processed = ngramProcessingScale(filtered, size, scales);
      saveSequence(processed, tempo);

      clearDots();
      var uniqueProcessed = UdukUtil.unique(processed);
      for (var i = 0; i < uniqueProcessed.length; i++) {
        var d = drawSeq6(f, uniqueProcessed[i], "ns");
        ZhredCanvas_Notes.push(d);
      }

      var seqReady = UdukSequence.toMIDI(processed);
      playToneJS(seqReady, tempo);
    }
  }
  else if (ngram.match(/midi/g)) {
    if (ZhredMIDI) {
      var input = ngram.split(" ");
      var message = [];
      var command = parseInt(input[1]);
      var program = parseInt(input[2]);
      message.push(command);
      message.push(program);
      UdukMIDI.sendMessage(message);
      clearAllCanvas();
    }
  }

}

function loadDrawer(processed) {
  clearAllCanvas();
  var uniqueProcessed = UdukUtil.unique(processed);
  for (var i = 0; i < uniqueProcessed.length; i++) {
    var d = drawSeq6(f, uniqueProcessed[i], "l");
    ZhredCanvas_Notes.push(d);
  }
}

function handleFile(evt) {
  var f = evt.target.files[0]; 

  if (f) {
    var r = new FileReader();
    r.onload = function(e) { 
      var inputLoad = e.target.result;
      inputLoad = inputLoad.replace(/ /g,'');
      var inputParse = inputLoad.split("|");
      var tempo = inputParse[0];
      var processed = inputParse[1].split(",");

      loadDrawer(processed); 

      var seqReady = UdukSequence.toMIDI(processed);
      playToneJS(seqReady, tempo);
    }
    r.readAsText(f);
  } else { alert("Failed to load file"); }

}
  
$(document).ready(function() {

  $('#canvas').delay(200).css('visibility','visible').hide().fadeIn("slow");
  $('#footer').delay(200).css('visibility','visible').hide().fadeIn("slow");

  initializeToneJS();

  $("#play").click(function() {
    var d1 = new Date();
    var n1 = d1.getTime();
    ZhredCanvas_TextItem.content = 'start: ' + n1;
      playZhred(); 
    var d2 = new Date();
    var n2 = d2.getTime();
    ZhredCanvas_TextItem.content += ' end: ' + n2;
    ZhredCanvas_TextItem.content += ' elapsed: ' + (n2-n1) + ' ms -';
    ZhredCanvas_TextItem.content += ' ♩ ♪ ♫ ♬ ♭ ♮ ♯';
  });

  $("#clear").click(function() {
    clearAllCanvas();
  });

  $("#save").click(function() {
    if (ZhredSequence_Save !== undefined) {
      alert("скопіювати і вставити в текстовий файл: \n" + ZhredSequence_Save);
    }
  });

  $("#ngram").keypress(function(event) {
    var ngram = document.getElementById('ngram').value;
    if (ngram.match(/metronome\s*\d{2}/g)) {
      $("#ngram").css("background-color", "#d84f4f");
    }
    else if (ngram.match(/batik\s*\d{2}/g)) {
      $("#ngram").css("background-color", "#ddd");
    }
    else if (ngram.match(/\d{1} [\174] chromatic [\174] \d{2}/g)) {
      $("#ngram").css("background-color", "#00BFFF");
    }
    else if (ngram.match(/\d{1} [a-zA-Z 0-9\#\,\|]* \d{2}/g)) {
      $("#ngram").css("background-color", "#FFA500");
    }
    else if (ngram.match(/(http(s?))\:\/\//gi)) {
      $("#ngram").css("background-color", "#C0FF3E");
    }
    else if (ngram.match(/midi/g)) {
      $("#ngram").css("background-color", "#87CEFA");
    }
    else {
      $("#ngram").css("background-color", "#fff");
    }
  });

  var ZhredSequence_AutoPilot = false;
  $("#auto-pilot").click(function() {
    ZhredSequence_AutoPilot = !ZhredSequence_AutoPilot;
    if (ZhredSequence_AutoPilot) {
      playAutoPilot(); 
      $("#autopilotref").text("Stop");
      ZhredCanvas_Raster = new Raster('img/frog.png');
      ZhredCanvas_Raster.position = view.center;
      ZhredCanvas_Raster.opacity = 0.8;
      ZhredCanvas_Block = drawBlock6(f, 1, 24);
    }
    else {
      Tone.Transport.stop();
      ToneJS_Pattern_Pattern.dispose();
      delete ToneJS_Pattern_Pattern;
      $("#autopilotref").text("Auto Pilot");
      ZhredCanvas_Raster.remove();
      delete ZhredCanvas_Raster;
      ZhredCanvas_Block.remove();
    }
  });

  var ZhredBoard_Blind = false;
  $("#blind").click(function() {
    ZhredBoard_Blind = !ZhredBoard_Blind;
    if (ZhredBoard_Blind) {
      blindMode6(true); 
      $("#blindref").text("Show Me");
    }
    else {
      blindMode6(false); 
      $("#blindref").text("Blind Mode");
    }
  });
  
  var ZhredBoard_Scale = false;
  $("#scale").click(function() {
    ZhredBoard_Scale = !ZhredBoard_Scale;
    if (ZhredBoard_Scale)
      $('#scaleForm').delay(200).css('visibility','visible').fadeIn("slow");
    else
      $('#scaleForm').delay(200).css('visibility','none').fadeOut("slow");
  });

  $('#selectScale').on('change', function() {

    var root = document.getElementById("inputRoot").value.toUpperCase();
    if (root == "GB") {
      root = "F#";
    }
    else if (root == "AB") {
      root = "G#";
    }
    else if (root == "BB") {
      root = "A#";
    }
    else if (root == "DB") {
      root = "C#";
    }
    else if (root == "EB") {
      root = "D#";
    }

    var scale = this.value;

    if ( (root.match(/[aA-gG]/g) || root.match(/[aA-gG][#]/g)) && root.length >= 1 && root.length <=2)
    {

      $.getJSON("scale.json", function(obj) {
        var name = obj[scale];
        $.each(name, function(i, scale) {
            if (scale.root == root) {
             
              clearAllCanvas();
              document.getElementById("ngram").value = scale.note.toString();
              
              for (var i = 1; i <= 6; i++) {
                var seq = UdukSequence.toFretNote(i, scale.note)

                for (var j = 0; j < seq.length; j++) {
                  var z = UdukSequence.splitNote(seq[j]);
                  var d = drawNote6(f, z[0], z[1], "");
                  ZhredCanvas_Notes.push(d);
                }
              }

            }
        });
      });
      
    }

  });
  
  $("#zonify").click(function() {
    var noteMap = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"];
    var ngram = document.getElementById('ngram').value;
    if (ngram.match(/(http(s?))\:\/\//gi)) {
    
      $.getJSON(ngram, function(data) {
        
        ZhredCanvas_Raster = new Raster('img/robot.png');
        ZhredCanvas_Raster.position = view.center;
        ZhredCanvas_Raster.opacity = 0.8;

        var result = JSON.stringify(data);
        result = result.toUpperCase();
        var seqReady = [];
        for (var i = 0; i < result.length; i++) {
          if (result[i].charCodeAt(0) >= 64 && result[i].charCodeAt(0) <= 71) {
            seqReady.push(result[i] + "" + 4);
          }
          else {
            var noteIdx = Math.floor(Math.random() * (12 - 0)) + 0;
            seqReady.push(noteMap[noteIdx]);
          }
        }
              
        playToneJS(seqReady, Math.floor(Math.random() * (171 - 160)) + 160);
       });

    }

  });
  
  $("#device").click(function() {
    $('#deviceDiv').delay(200).css('visibility','visible').hide().fadeIn("slow");

    if (!ZhredMIDI) {
      var polySynth = new Tone.PolySynth(4, Tone.MonoSynth).toMaster();
      polySynth.volume.value = -36;
      polySynth.triggerAttackRelease(["C2", "E2", "G3", "B3"], "2n");
    
      UdukMIDI.initialize();
      ZhredMIDI = true;
    }
    
    var timer_t = setInterval(intervalSequence, 1800);
    function intervalSequence() {
      $('#deviceDiv').delay(200).css('visibility','none').fadeOut("slow");
      clearInterval(timer_t);
    }
    
  });
  
  var inputElement = document.getElementById("upload");
  inputElement.addEventListener("change", handleFile, false);

  console.log("%c ZhredCanvas v1.0", "background: #000; color: #fff");
});
