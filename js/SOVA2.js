navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
        handlerFunction(stream)
    })


function handlerFunction(stream) {
    rec = new MediaRecorder(stream);
    rec.ondataavailable = e => {
        audioChunks.push(e.data);
        if (rec.state == "inactive") {
            let blob = new Blob(audioChunks, {type: 'audio/mpeg-3'});
            // postData(' http://localhost:5000/update-prediction', {"audio": "gg"})
            //     .then((data) => {
            //             changeStates(data["command"]);
            //         }
            //     );
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
                var base64data = reader.result;
                postData(' http://localhost:5000/get-intent', {"audio": base64data})
                    .then((data) => {
                            changeStates(data["command"]);
                            document.getElementById("client_text").innerText = "Recognized text: " + data["response"]
                        }
                    );
            }
            recordedAudio.src = URL.createObjectURL(blob);
            recordedAudio.controls = false;
            recordedAudio.autoplay = false;
            sendData(blob)
        }
    }
}


function sendData(data) {
}

var stR = document.getElementById("startRecord")
var was_clicked = false

stR.onclick = function () {
    if (was_clicked == false) {
        was_clicked = true
        stR.style.backgroundColor = "grey"
        audioChunks = [];
        rec.start()
    } else {
        was_clicked = false
        stR.style.backgroundColor = "red"
        rec.stop();
    }
}


function changeStates(commandData) {
    if (commandData === null) return;

    const device = commandData["device"]
    const parameters = commandData["parameters"]
    const lightCurVal = parseInt(document.getElementById("light_brightness").value)
    const condTempCurVal = parseInt(document.getElementById("cond_temp").value)
    const tvVolCurVal = parseInt(document.getElementById("tv_volume").value)
    switch (device) {
        case "light":
            document.getElementById("light_switch").checked = parameters["active"];
            document.getElementById("light_brightness").value = parameters["brightness"];
            document.getElementById("light_color").value = parameters["color"];
            break;
        case "curtains":
            document.getElementById("curtain_switch").checked = parameters["open"];
            break;
        case "conditioner":
            document.getElementById("cond_switch").checked = parameters["active"];
            document.getElementById("cond_temp").value = parameters["temperature"];
            break;
        case "tv":
            document.getElementById("tv_power_switch").checked = parameters["active"];
            document.getElementById("tv_mute_switch").checked = !parameters["muted"];
            document.getElementById("tv_volume").value = parameters["volume"];
            break;
        case "air":
            document.getElementById("air_temp").value = parameters["temperature"].toString();
            document.getElementById("air_hum").value = parameters["humidity"].toString();
            document.getElementById("air_co2").value = parameters["CO2"].toString();
            break;
    }
}

function randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
}

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}


var timeDisplay = document.getElementById("cur_time");


function refreshTime() {
    var dateString = new Date().toLocaleString("ru-RU", {timeZone: "Europe/Moscow"});
    var formattedString = dateString.replace(", ", " - ");
    timeDisplay.innerHTML = formattedString;
}

setInterval(refreshTime, 1000);