import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions, // 공간
  ActivityIndicator, // 동작 확인
  StyleSheet,
  ScrollView, // 옆으로 넘기기
  TouchableOpacity, //클릭 동작
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const API_KEY = "784ab24ff2ed5d94d4288abed9e25d13";

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const [isOn, setIsOn] = useState(false);
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmTime, setAlarmTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    setDays(json.daily);
  };

  useEffect(() => {
    getWeather();
  }, []);

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setAlarmTime(selectedTime);
      setAlarmSet(true);
    }
  };

  useEffect(() => {
    if (alarmSet && alarmTime) {
      const alarmTimeout = setTimeout(() => {
        alert("Alarm ringing!");
        setAlarmSet(false);
        setAlarmTime(null);
      }, alarmTime.getTime() - new Date().getTime());

      return () => clearTimeout(alarmTimeout);
    }
  }, [alarmSet, alarmTime]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={{ ...styles.day, alignItems: "center" }}>
            <ActivityIndicator
              color="white"
              style={{ marginTop: 10 }}
              size="large"
            />
          </View>
        ) : (
          days.map((day, index) => {
            const date = new Date(day.dt * 1000);
            const dateString = date.toLocaleDateString(undefined, {
              weekday: "long",
            });

            return (
              <View key={index} style={styles.day}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.temp}>
                    {parseFloat(day.temp.day).toFixed(1)}
                  </Text>
                  <Fontisto
                    name={icons[day.weather[0].main]}
                    size={68}
                    color="white"
                  />
                </View>
                <Text style={styles.date}>{dateString}</Text>
                <Text style={styles.description}>{day.weather[0].main}</Text>
                <Text style={styles.tinyText}>Humidity: {day.humidity}%</Text>
              </View>
            );
          })
        )}
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <View style={styles.button}>
          <MaterialCommunityIcons
            name={isOn ? "water-off" : "water"}
            size={48}
            color="white"
            onPress={() => setIsOn(!isOn)}
          />
          <Text style={styles.buttonText}>{isOn ? "Off" : "On"}</Text>
        </View>
        <View style={styles.button}>
          <MaterialCommunityIcons
            name={alarmSet ? "alarm" : "alarm-off"}
            size={48}
            color="white"
            onPress={() => setShowTimePicker(!showTimePicker)}
          />
          <Text style={styles.buttonText}>
            {alarmSet ? `Time: ${alarmTime?.toLocaleTimeString()}` : "Set"}
          </Text>
        </View>
      </View>
      {showTimePicker && (
        <DateTimePicker
          value={alarmTime || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "skyblue",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 58,
    fontWeight: "500",
    color: "white",
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  temp: {
    marginTop: 50,
    fontWeight: "600",
    fontSize: 100,
    color: "white",
  },
  date: {
    marginTop: -10,
    fontSize: 20,
    color: "white",
    fontWeight: "500",
  },
  description: {
    marginTop: -10,
    fontSize: 30,
    color: "white",
    fontWeight: "500",
  },
  tinyText: {
    marginTop: -5,
    fontSize: 25,
    color: "white",
    fontWeight: "500",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  button: {
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    marginTop: 5,
  },
});
