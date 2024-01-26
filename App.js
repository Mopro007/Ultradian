import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ImageBackground, Linking } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Audio } from 'expo-av';

export default function App() {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [rythm, setRythm] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [trackingStarted, setTrackingStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [secondsCounter, setSecondsCounter] = useState(60);
  const [sound, setSound] = useState();

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (time) => {
    setSelectedTime(time);
    hideDatePicker();
  };

  const whichCycle = (rythm) => {
    alert("alerting from the begining of the whichCycle() function... \nrythm : "+rythm+"\ncurrent cycle"+currentCycle+"\ncurrent time: "+currentTime+"\nremaining time: "+remainingTime);
    let current_time = new Date().getHours()*60 + new Date().getMinutes();
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 2; j++) {
        const range = rythm[i][j];
        if (current_time >= range[0] && current_time <= range[1]) {
          setCurrentCycle(rythm[i]);
        };
      };
    };
    alert("alerting from the end of the whichCycle() function... \nrythm : "+rythm+"\ncurrent cycle"+currentCycle+"\ncurrent time: "+currentTime+"\nremaining time: "+remainingTime);
  };

  const nextCycle = (currentCycle) => {
    const peakLawerLimit = currentCycle[1][1];
    const peakHigherLimit = peakLawerLimit + 90;
    const troughLawerLimit = peakHigherLimit;
    const troughHigherLimit = troughLawerLimit + 20;
    const nxtCycle = [[peakLawerLimit,peakHigherLimit],[troughLawerLimit,troughHigherLimit]];
    setCurrentCycle(nxtCycle);
  };

  const startTracking = () => {
    if (selectedTime) {
      console.log("tracking started...");
      const rythm = [];
      let cursor = new Date(selectedTime).getHours()*60 + new Date(selectedTime).getMinutes();
      for (let cycle = 0; cycle < 13 ; cycle++) {
        let peak = [cursor,cursor+90]
        cursor = peak[1]
        let trough = [cursor,cursor+20]
        cursor = trough[1]
        rythm.push([peak,trough])
      }
      console.log(rythm);
      setRythm(rythm);
      whichCycle(rythm);
      setTrackingStarted(true);
      setCurrentTime(new Date().getHours()*60 + new Date().getMinutes());
    }
    else{
      alert("Please select a wake-up time");
    }
  };
  
  stopTracking = () => {
    console.log("tracking stopped!");
    setTrackingStarted(false);
    setSelectedTime(null);
    setCurrentTime(null);
    setRythm([]);
    setCurrentCycle(null);
    setIsBreakTime(false);
    setRemainingTime(null);
    setSecondsCounter(60);
  };

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync( require('./assets/audio/hello.mp3'));
    setSound(sound);
    await sound.playAsync();
  };

  const reFreshRemaining = () => {
    alert("alerting from the begining of the refreshRemaining() function... \nrythm : "+rythm+"\ncurrent cycle"+currentCycle+"\ncurrent time: "+currentTime+"\nremaining time: "+remainingTime);
    if (currentTime !== null && currentCycle !== null ) {
      let remaining = null;
      if (currentCycle[0][0] <= currentTime && currentCycle[0][1] >= currentTime) {remaining = currentCycle[0][1] - currentTime; console.log("remaining variable refreshed... remaining time: "+remaining);}
      if (currentCycle[1][0] <= currentTime && currentCycle[1][1] >= currentTime) {remaining = currentCycle[1][1] - currentTime; console.log("remaining variable refreshed... remaining time: "+remaining);}
      if (remaining === 0) {
        if(isBreakTime){nextCycle(currentCycle)};
        setIsBreakTime(!isBreakTime);
        playSound();
      };
      setRemainingTime(remaining);
    };
    alert("alerting from the end of the refreshRemaining() function... \nrythm : "+rythm+"\ncurrent cycle"+currentCycle+"\ncurrent time: "+currentTime+"\nremaining time: "+remainingTime);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getHours() * 60 + new Date().getMinutes());
      setSecondsCounter(60);
    }, 60000);
    return () => clearInterval(interval);
    }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsCounter(secondsCounter-1);
    }, 1000);
    return () => clearInterval(interval);
    },);

  useEffect(() => {
    if(trackingStarted){
      reFreshRemaining();
    }
  }, [currentTime]);
  

  return (
    <ImageBackground source={require('./assets/images/first.jpg')} style={styles.container}>
      <Text style={styles.header}>Ultradian</Text>
      {trackingStarted === false ? (<TouchableOpacity onPress={showDatePicker}><View style={styles.Button}><Text>Set Wake-Up Time</Text></View></TouchableOpacity>) : null}
      {trackingStarted === false ? (<DateTimePickerModal isVisible={isDatePickerVisible} mode="time" onConfirm={handleConfirm} onCancel={hideDatePicker} />) : null}
      {trackingStarted === false ? ( <TouchableOpacity onPress={startTracking}><View style={styles.Button}><Text>Start Tracking</Text></View></TouchableOpacity> ) : null}
      {trackingStarted === false ? selectedTime && ( <Text style={styles.selectedTime}>Selected Wake-Up Time: {selectedTime.toLocaleTimeString()}</Text> ) : null}
      {remainingTime !== null ? ( <Text style={styles.remainingTime}>{remainingTime}:{secondsCounter}</Text> ) : null}
      {remainingTime !== null ? ( <Text style={styles.breakOrPeak}>until next {isBreakTime ? 'Peak' : 'Break'}</Text> ) : null}
      {trackingStarted === true ? ( <TouchableOpacity onPress={stopTracking}><View style={styles.Button}><Text>Stop Tracking</Text></View></TouchableOpacity>) : null}
      <TouchableOpacity onPress={() => Linking.openURL('https://mopro007.pythonanywhere.com/')} style={styles.rights}><Text style={styles.rights}>Developed by Moe Hasan</Text></TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'start',
    paddingVertical: 100,
  },
  header: {
    fontSize: 40,
    marginBottom: 180,
    fontFamily: 'AvenirNext-Heavy',
    color: 'white',
  },
  Button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 0,
    elevation: 3,
    marginTop: 20,
    backgroundColor: 'white',
  },
  selectedTime: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: 'AvenirNext-Heavy',
    color: 'white',
  },
  remainingTime: {
    fontSize: 60,
    marginTop: 5,
    fontFamily: 'AvenirNext-Heavy',
    color: 'white',
  },
  breakOrPeak: {
    fontSize: 18,
    marginTop: 5,
    fontFamily: 'AvenirNext-Heavy',
    color: 'white',
  },
  rights: {
    fontSize: 12,
    color: 'white',
    position: 'absolute',
    bottom: 20,
    left: 70,
  },
});
