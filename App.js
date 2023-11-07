import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ImageBackground, Linking } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Audio } from 'expo-av';

export default function App() {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [rythm, setRythm] = useState(null);
  const [currentCycle, setCurrentCycle] = useState(0);
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
    let current_time = new Date().getHours()*60 + new Date().getMinutes();
    let closestCycle = null;
    let minDifference = Number.POSITIVE_INFINITY;
    for (const cycle of rythm) {
      for (const period of cycle) {
        for (const limit of period) {
          const difference = Math.abs(current_time - limit);
          if (difference < minDifference) {
            minDifference = difference;
            closestCycle = cycle;
          }
        }
      }
    }
    setCurrentCycle(closestCycle);
  }

  const startTracking = () => {
    if (selectedTime) {
      console.log("tracking started!");
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
    setRythm(null);
    setCurrentCycle(null);
    setIsBreakTime(false);
    setRemainingTime(null);
    setSecondsCounter(60);
  };

  async function playSound() {
    if (sound) {
      console.log("there's a sound!");
      await sound.replayAsync(); // Use replayAsync() to play the sound.
      console.log("sound played!");
    }
  };

  const reFreshRemaining = () => {
    if (currentTime !== null && currentCycle !== null ) {
      let remaining = null;
      if (currentCycle[0][0] <= currentTime && currentCycle[0][1] >= currentTime) {remaining = currentCycle[0][1] - currentTime; setIsBreakTime(false); console.log("remaining variable refreshed!");}
      if (currentCycle[1][0] <= currentTime && currentCycle[1][1] >= currentTime) {remaining = currentCycle[1][1] - currentTime; setIsBreakTime(true); console.log("remaining variable refreshed!");}
      if (remaining === 0) {
        playSound();
        whichCycle(rythm);
      };
      setRemainingTime(remaining);
    };
  };

  useEffect(() => {
    (async () => {
      const sound = await Audio.Sound.createAsync(
        require('./assets/audio/hello.mp3')
      );
      setSound(sound);
    });
  },[]);

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
    },[]);

  useEffect(() => {
    if(trackingStarted){
      reFreshRemaining();
    }
  }, [currentTime]);
  

  return (
    <ImageBackground source={require('./assets/images/first.jpg')} style={styles.container}>
      <Text style={styles.header}>Ultradian</Text>
      {!trackingStarted && (<TouchableOpacity onPress={showDatePicker}><View style={styles.Button}><Text>Set Wake-Up Time</Text></View></TouchableOpacity>)}
      {!trackingStarted && (<DateTimePickerModal isVisible={isDatePickerVisible} mode="time" onConfirm={handleConfirm} onCancel={hideDatePicker} />)}
      {!trackingStarted && ( <TouchableOpacity onPress={startTracking}><View style={styles.Button}><Text>Start Tracking</Text></View></TouchableOpacity> )}
      {!trackingStarted && selectedTime && ( <Text style={styles.selectedTime}>Selected Wake-Up Time: {selectedTime.toLocaleTimeString()}</Text> )}
      {remainingTime && ( <Text style={styles.remainingTime}>{remainingTime}:{secondsCounter}</Text> )}
      {remainingTime && ( <Text style={styles.breakOrPeak}>until next {isBreakTime ? 'Peak' : 'Break'}</Text> )}
      {trackingStarted && ( <TouchableOpacity onPress={stopTracking}><View style={styles.Button}><Text>Stop Tracking</Text></View></TouchableOpacity>)}
      <TouchableOpacity onPress={() => Linking.openURL('https://mopro007.pythonanywhere.com/')} style={styles.rights}><Text style={styles.rights}>Developed by Moe Hasan</Text></TouchableOpacity>
      <TouchableOpacity onPress={playSound} style={styles.Button}><Text>Play sound</Text></TouchableOpacity>
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
