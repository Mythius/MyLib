(function (global) {
  const Voice = {};
  let speech = new p5.Speech();
  let speechRec = new p5.SpeechRec("en-US", gotSpeech);
  let interim = false;
  let callback = () => {};

  function startListening(cb = () => {}, continuous = true) {
    callback = cb;
    speechRec.start(continuous, interim);
  }

  function stopListening() {
    speechRec.stop();
  }

  async function lamespeak(text) {
    speech.speak(text);
  }

  async function speak(text) {
    return new Promise(async (res, rej) => {
      const response = await fetch(
        "https://kokoro.msouthwick.com/v1/audio/speech",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "kokoro",
            input: text,
            voice: "am_adam",
            response_format: "mp3",
            download_format: "mp3",
            speed: 1,
            stream: true,
            return_download_link: false,
            lang_code: "en-us",
            volume_multiplier: 1,
            normalization_options: {
              normalize: true,
              unit_normalization: false,
              url_normalization: true,
              email_normalization: true,
              optional_pluralization_normalization: true,
              phone_normalization: true,
              replace_remaining_symbols: true,
            },
          }),
        },
      ).catch(rej);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        res();
      };
      audio.play();
    });
  }

  async function gotSpeech() {
    if (speechRec.resultValue) {
      let input = speechRec.resultString;
      callback(input);
    }
  }

  Voice.startListening = startListening;
  Voice.stopListening = stopListening;
  Voice.speak = speak;
  Voice.lamespeak = lamespeak;

  global.Voice = Voice;
})(this);
