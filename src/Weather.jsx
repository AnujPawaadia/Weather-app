import React, { useState, useEffect, useCallback } from "react";
import { backgrounds } from "./backgrounds";
import "./Wheather.css";

const Weather = () => {
  const api = {
    key: "827c82bd833862488412a5bb2c47eb48",
    base: "http://api.openweathermap.org/data/2.5/",
  };

  const [weather, setWeather] = useState({});
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  const search = (evt) => {
    if (evt.key === "Enter") {
      fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`)
        .then((res) => res.json())
        .then((result) => {
          setWeather(result);
          setQuery("");
        });
    }
  };

  const getTimeOfDay = useCallback((timezoneOffset) => {
    const localTime = new Date(new Date().getTime() + timezoneOffset * 1000);
    const hour = localTime.getUTCHours();
    if (hour >= 5 && hour < 12) {
      return "morning";
    } else if (hour >= 12 && hour < 18) {
      return "afternoon";
    } else if (hour >= 18 && hour < 21) {
      return "evening";
    } else {
      return "night";
    }
  }, []);

  const getBackgroundVideo = useCallback(() => {
    if (
      !weather ||
      !weather.main ||
      !weather.weather ||
      weather.weather.length === 0
    ) {
      return ""; // Return empty string if weather data is not available or incomplete
    }

    const weatherMain = weather.weather[0].main.toLowerCase();
    const timeOfDay = getTimeOfDay(weather.timezone);

    // Check if the specified weather condition and time of day exist in the backgrounds object
    if (backgrounds[weatherMain] && backgrounds[weatherMain][timeOfDay]) {
      return backgrounds[weatherMain][timeOfDay];
    } else {
      return ""; // Return empty string if the background video URL is not found
    }
  }, [weather, getTimeOfDay]);

  useEffect(() => {
    if (weather.timezone !== undefined) {
      const backgroundVideoURL = getBackgroundVideo();
      const video = document.querySelector(".video-background");
      if (video) {
        video.src = backgroundVideoURL;
        video.load();
      }
    }

    // Update date and time
    const interval = setInterval(() => {
      if (weather.timezone !== undefined) {
        const currentDate = new Date();
        setDate(dateBuilder(currentDate, weather.timezone));
      }
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, [weather, getBackgroundVideo]);

  const dateBuilder = (d, timezoneOffset) => {
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    let localDate = new Date(
      d.getTime() + (timezoneOffset + d.getTimezoneOffset() * 60) * 1000
    ); // Adjust for timezone offset and local timezone
    let day = days[localDate.getDay()];
    let date = localDate.getDate();
    let month = months[localDate.getMonth()];
    let year = localDate.getFullYear();
    let hour = localDate.getHours();
    let minute = localDate.getMinutes();
    let second = localDate.getSeconds();
    let period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Convert to 12-hour format

    return `${day} ${date} ${month} ${year} ${hour}:${
      minute < 10 ? "0" + minute : minute
    }:${second < 10 ? "0" + second : second} ${period}`;
  };

  return (
    <div className={`weather-container`}>
      <video autoPlay loop muted className={`video-background`}>
        <source src={getBackgroundVideo()} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="main-content">
        <div className="search-box">
          <input
            type="text"
            className="search-bar"
            placeholder="Search ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={search}
          />
        </div>
        {typeof weather.main !== "undefined" ? (
          <div>
            <div className="location-box">
              <div className="location">
                {weather.name}, {weather.sys.country}
              </div>
              <div className="date">{date}</div>
            </div>
            <div className="weather-box">
              <div className="temp">{Math.round(weather.main.temp)}°C</div>
              <div className="weather">{weather.weather[0].main}</div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Weather;
