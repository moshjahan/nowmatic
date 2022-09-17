/*
	Summer of Code 2022 
	Mosh Jahán
	moshjahan@gmail.com
*/
      
function link(scope, element, attrs, controller) 
{
	var notes =
	[
		{ note : "B", type : "natural", frequency : 246.94 },
		{ note : "A#", type : "sharp", frequency : 233.08 }, 
		{ note : "A", type : "natural", frequency : 220.00 }, 
		{ note : "G#", type : "sharp", frequency : 207.65 }, 
		{ note : "G", type : "natural", frequency : 196.00 }, 
		{ note : "F#", type : "sharp", frequency : 185.00 }, 
		{ note : "F", type : "natural", frequency : 174.61 }, 
		{ note : "E", type : "natural", frequency : 164.81 }, 
		{ note : "D#", type : "sharp", frequency : 155.56 }, 
		{ note : "D", type : "natural", frequency : 146.83 }, 
		{ note : "C#", type : "sharp", frequency : 138.59 }, 
		{ note : "C", type : "natural", frequency : 130.81 }
	];
		
	var pattern =
	{
		"B"  : [],
		"A#" : [],
		"A"  : [],
		"G#" : [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
		"G"  : [],
		"F#" : [],
		"F"  : [1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
		"E"	 : [],
		"D#" : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		"D"	 : [],
		"C#" : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1],
		"C"	 : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1]
	};
	
	var SynthesizerState =
	{
		STOPPED : 0,
		RUNNING : 1
	};
	
	var PATTERN_STEPS_MAX = 32;
	
	var playStep = 0;
	var playBeatsPerMinute = 120;
	
	var deltaTimePrevious = 0;
	var deltaTimeElapsed = 0;	
	
	var synthesizer =
	{
		audioContext : null,
		oscillator1 : null,
		oscillator2 : null,
		currentFrequency : null,
		previousFrequency : null,
		flange : 0,
		state : SynthesizerState.STOPPED
	};

	
	function initializeSynthesizer()
	{
		synthesizer.audioContext = new AudioContext();
		
		synthesizer.oscillator1 = synthesizer.audioContext.createOscillator();
		synthesizer.oscillator1.connect(synthesizer.audioContext.destination);
		synthesizer.oscillator1.type = "sine";
		synthesizer.oscillator1.frequency.value = 0;
		synthesizer.oscillator1.start();
		
		synthesizer.oscillator2 = synthesizer.audioContext.createOscillator();
		synthesizer.oscillator2.connect(synthesizer.audioContext.destination);
		synthesizer.oscillator2.type = "triangle";
		synthesizer.oscillator2.frequency.value = 0;
		synthesizer.oscillator2.start();		
	}
	
	function setOscillatorFrequency(frequency)
	{
		synthesizer.oscillator1.frequency.value = frequency;
		synthesizer.oscillator2.frequency.value = frequency + synthesizer.flange;
	}
	
	function setFlange(e)
	{
		synthesizer.flange = parseFloat(e.target.value);
	}
	
	function setOscillatorType(e)
	{
		var oscillatorId = "oscillator" + e.target.getAttribute("data-osc");
		var oscillatorType = e.target.getAttribute("data-type");
		
		synthesizer[oscillatorId].type = oscillatorType;
	}
	
	function stopSynthesizer()
	{
		synthesizer.oscillator1.frequency.value = 0;
		synthesizer.oscillator2.frequency.value = 0;
	}
	
	function playNote(step)
	{
		setOscillatorFrequency(0);
		
		for (var i = 0; i < notes.length; i++)
		{
			var noteStep = pattern[notes[i].note][step];
			
			if (noteStep == true)
			{
				setOscillatorFrequency(notes[i].frequency);
			}
		}		
	}
	
	function nextStep(deltaTime)
	{
		var delta = deltaTime - deltaTimePrevious;

		deltaTimePrevious = deltaTime;
		deltaTimeElapsed += delta;
		
		if (deltaTimeElapsed > 110)
		{		
			deltaTimeElapsed = 0;
		
			playNote(playStep);
			
			for (var index = 0; index < PATTERN_STEPS_MAX; index++)
			{
				var light = document.getElementById("light-" + index);

				if (index === playStep)
				{
					light.classList.add("illuminate");
				}
				else
				{
					light.classList.remove("illuminate");
				}				
			}
		
			playStep++;
					
			if (playStep == PATTERN_STEPS_MAX)
			{
				playStep = 0;
			}
		}
		
		if (synthesizer.state == SynthesizerState.RUNNING)
		{
			requestAnimationFrame(nextStep);
		}
	}
	
	function runSequencer()
	{
		synthesizer.state = SynthesizerState.RUNNING;
		requestAnimationFrame(nextStep);
	}
	
	function stopSequencer()
	{
		synthesizer.state = SynthesizerState.STOPPED;
		stopSynthesizer();
	}
	
	function controlSequencer()
	{
		if (synthesizer.state == SynthesizerState.STOPPED)
		{		
			runSequencer();
		}
		else
		{
			stopSequencer();
		}
	}
		
	function clearPatternStep(step)
	{
		for (var i = 0; i < notes.length; i++)
		{
			pattern[notes[i].note][step] = 0;
			
			var id = notes[i].note + step;
			
			document.getElementById(id)
				.classList.remove("step-selected");
		}
	}
	
	function toggleStep(event)
	{
		var target = event.target;
		
		var note = target.getAttribute("data-note");
		var step = target.getAttribute("data-step");
		
		if (pattern[note][step])
		{
			target.classList.toggle("step-selected");
			pattern[note][step] = 0;	
		}
		else
		{
			clearPatternStep(step);
			target.classList.toggle("step-selected");
			pattern[note][step] = 1;	
		}		
		
		console.clear();
		console.table(pattern);
	}
	
	function drawSequencerGrid()
	{
		var grid = document.getElementById("SequencerGrid");
		
		for (var index = 0; index < notes.length; index++)
		{
			var note = notes[index];
			
			var noteLane = document.createElement("div");
		
			noteLane.className = "grid-lane";
			grid.appendChild(noteLane);
			
			var noteKey = document.createElement("div");
			
			noteKey.textContent = note.note;
			noteKey.className = "note " + note.type;
			
			noteLane.appendChild(noteKey);
			
			for (var step = 0; step < PATTERN_STEPS_MAX; step++)
			{
				var barStep = document.createElement("div");
				
				barStep.setAttribute("id", note.note + step);
				barStep.setAttribute("data-note", note.note);
				barStep.setAttribute("data-step", step);
		
				barStep.className = "bar " + (step % 4 == 0 ? "start" : "step");		
				barStep.classList.toggle("step-selected", pattern[note.note][step] == 1);	
				
				barStep.addEventListener("click", toggleStep);

				noteLane.appendChild(barStep);				
			}
		}	
	}
	
	function drawSequencerLights()
	{
		var grid = document.getElementById("SequencerGrid");
		var lightLane = document.createElement("div");
		
		lightLane.className = "grid-lane";
		grid.appendChild(lightLane);
			
		var spacer = document.createElement("div");
			
		spacer.className = "note";
			
		lightLane.appendChild(spacer);
			
		for (var step = 0; step < PATTERN_STEPS_MAX; step++)
		{
			var barStep = document.createElement("div");
				
			barStep.setAttribute("id", "light-" + step);
			barStep.setAttribute("data-step", step);
			
			barStep.className = "light " + (step % 4 == 0 ? "start" : "step");

			lightLane.appendChild(barStep);
		}
	}
	
	function initializeControls()
	{
		var button = document.getElementById("PatternRun");
		var flange = document.getElementById("Flange");
		
		button.addEventListener("click", controlSequencer);
		flange.addEventListener("change", setFlange);
		
		var oscillatorType = document.querySelectorAll(".oscillator-type");
		
		for (var i = 0; i < oscillatorType.length; i++)
		{
			oscillatorType[i].addEventListener("click", setOscillatorType);
		}
	}
	
	function initialize()
	{
		console.clear();
		console.log("Audio Synthesiser");
		
		drawSequencerGrid();
		drawSequencerLights();
		
		initializeControls();		
		initializeSynthesizer();
	}
	
	initialize();
}