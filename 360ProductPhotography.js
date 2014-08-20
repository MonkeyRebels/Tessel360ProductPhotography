//flash trigger,Studio photography, rotate product table 10 degrees. use infrared to trigger camarea.
//original library http://sebastian.setz.name/arduino/my-libraries/multi-camera-ir-control/
//also has some Canon and other camera IR codes.

//Version 1, it has some todo's.. but a nice start for anyone interested.

var tessel = require('tessel');
var infraredlib = require('ir-attx4');
var infrared = infraredlib.use(tessel.port['C']); 

var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port['D']);


var servolib = require('servo-pca9685'); 
var servo = servolib.use(tessel.port['B']);

var servo1 = 1; // We have a servo plugged in at position 1

var NikonFrequency = 40;
var servoPosition = 0;  // First position

var configButton = false;

// When we're connected
infrared.on('ready', function() {
	ambient.on('ready', function () {
			
			//initialize moter, position 0.
			servo.on('ready', function () {
	  			servo.configure(servo1, 0.05, 0.12, function () {
	      			servo.move(servo1, 0);
	  			});
			});
	
			//every 4 seconds, take a picture. This will trigger the flashes, the sound of the reload of the flash will trigger
			// the ambient module and the servo will turn 10 degrees.
			//using sound triggers. The flash equipment has a 1/125 duration. The ambient light trigger doesn't register the flash light.
  		    setInterval(function() {
   	    		ambient.setSoundTrigger(0.1); 

   	    		//Nikon IR code.
    	      	var irBuffer = new Buffer([0x07,0xd0,-0x6c,0xb6,0x01,0x86,-0x06,0x2c,0x01,0x9a,-0x0d,0xfc,0x01,0x90]); 
		      	infrared.sendRawSignal(NikonFrequency, irBuffer, function(err) {
			
			        if (err) {
			          console.log("Unable to send IR signal: ", err);
			        } else {
			          console.log("Take a picture!");
			        }
			
				});
		    
		    }, 4000); 
		 

			ambient.on('sound-trigger', function(data) {
				servoPosition++;
	    		
				ambient.clearSoundTrigger();

				 if (servoPosition > 3) {
				 	servoPosition = 0; //-1 so the next position will be 0. Keep in mind that the time to rotate to 0 must be within the picture interval
					//TODO:play audio file for new product.	
					//TODO:wait for input. 
				}
				
				console.log("Flash equipment reload beep, turn the table 10%. To position: ", (servoPosition*10),"%");
				
				servo.configure(servo1, 0.05, 0.12, function () {
      				servo.move(servo1, servoPosition/10);
   				});
		 		

			});
  
		
	});

});
