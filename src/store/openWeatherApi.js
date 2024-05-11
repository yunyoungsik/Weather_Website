import axios from 'axios';

export default {
  // namespaced: 하나의 store에서 모듈화하여 사용될 수 있음을 명시적으로 나타내는 개념
  namespaced: true,
  // state: 실제로 취급해야하는 데이터
  state: {
    position: {
      lat: 37.5683,
      lon: 126.9778,
    },
    cityName: 'Seoul',
    currentWeather: {
      // ManinView.vue에서 사용
      currentTemp: 0,
      currentIcon: '',
      currentHumidity: 0,
      currentWindSpeed: 0,
      currentFeelsLike: 0,
      // SubView.vue에서 사용
      currentSunrise: 0,
      currentSunset: 0,
      currentVisibility: 0,
    },
    hourlyWeather: [],
    images: [],
  },
  // getters: 게산된 상태의 데이터를 만들어내는 속성이다.
  // computed와 비슷한 기능을 한다.
  getters: {},
  // mutations, actions: methods와 유사한 기능을 가지고 있다.
  // 1. mutations: 변이 메서드, 우리가 관리하는 데이터(state)를 변경시켜줄 수 있다.
  // 즉, state 안의 데이터는 오로지 mutations에서만 데이털르 변경시킬 수 있다.
  mutations: {
    SET_LATLON(state, payload) {
      state.position.lat = payload.Ma;
      state.position.lon = payload.La;
    },
    SET_CITYNAME(state, payload) {
      state.cityName = payload;
    },
    SET_CURRENT_WEATHER(state, payload) {
      state.currentWeather.currentIcon = payload.weather[0].icon;
      state.currentWeather.currentTemp = Math.round(payload.main.temp); // 현재온도
      state.currentWeather.currentHumidity = payload.main.humidity; // 습도
      state.currentWeather.currentWindSpeed = payload.wind.speed; // 풍속
      state.currentWeather.currentFeelsLike = Math.round(payload.main.feels_like); // 체감온도
      state.currentWeather.currentSunrise = payload.sys.sunrise; // 일출시간
      state.currentWeather.currentSunset = payload.sys.sunset; // 일몰시간
      state.currentWeather.currentVisibility = payload.visibility; // 가시거리
    },
    SET_TIMELY_WEATHER(state, payload) {
      state.hourlyWeather = payload;
    },
    SET_IMAGEPATH(state, payload) {
      state.images = payload;
    },
  },
  // 2. actions: 특정한 데이터를 직접적으로 수정하는 것이 허용되지 않는다.
  // 위 사항이 가장 주의해야할 사항이고, 또한 비동기로 동작한다는 점도 유의하자.
  actions: {
    // actions 부분에선 mutations처럼 state를 바로 불러올 순 없고,
    // context라는 객체데이터를 호출하여 context를 참조하여 데이터를 불러온다.
    // context안에는 state. getters, mutations를 활용할 수 있는 내용이 들어있다.
    // mutations를 호출하기 위해서는 context.mutations가 아니라 context.commit('뮤테이션 이름', payload) 형식으로 호출해야한다.
    // 객체 구조분해하여 불러올 수도 있다.

    // OpenWeatherAPI 데이터 호출
    async FETCH_OPENWEATHER_API(context) {
      // context: 매개변수 전달

      const API_KEY = '11425be0d0b12e94cacae4113da0aaa6';
      let lat = context.state.position.lat;
      let lon = context.state.position.lon;

      try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        // console.log(res);
        context.commit('SET_CURRENT_WEATHER', res.data);
      } catch (err) {
        console.log(err);
      }

      try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        // console.log(res);
        const images = new Array();
        for (let i = 0; i < 24; i++) {
          const weatherIcon = res.data.list[i].weather[0].icon;
          images[i] = `src/assets/images/${weatherIcon}.png`;
        }

        context.commit('SET_IMAGEPATH', images);
        context.commit('SET_TIMELY_WEATHER', res.data.list);
      } catch (err) {
        console.log(err);
      }
    },
  },
};
