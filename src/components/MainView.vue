<template>
  <div class="leftContainer">
    <div id="cityNameBox">
      <div class="cityName">
        <p>{{ cityName }}</p>
        <p>{{ currentTime }}</p>
      </div>
    </div>
    <div id="contentsBox">
      <div class="buttonBox">
        <div class="buttonBackground">
          <button class="forecast">Forecast</button>
          <button class="airquality">Air Quality</button>
        </div>
      </div>
      <div class="weatherBox">
        <div class="weatherDegree">
          <p>{{ Math.round(currentTemp) }}&deg;</p>
        </div>
        <div class="weatherIcon">
          <!-- <img :src="require(`~/assets/images/${currentIcon}.png`)" alt="MainLogo" /> -->
          <img src="~/assets/images/04n.png" alt="" />
        </div>
        <div class="weatherData">
          <div v-for="temporary in temporaryData" :key="temporary.title" class="detailData">
            <p>{{ temporary.title }}</p>
            <p>{{ temporary.value }}</p>
          </div>
        </div>
      </div>
    </div>
    <div id="todayWeather">
      <div class="textBox">
        <p>시간대별 날씨 정보</p>
        <p>이번주 날씨 보기</p>
      </div>
      <div class="timelyWeatherBox">
        <div class="timelyWeather" v-for="(temp, index) in arrayTemps" :key="index">
          <div class="icon">
            <img :src="images[index]" alt="" />
          </div>
          <div class="data">
            <p class="time">{{ Unix_timestamp(temp.dt) }}</p>
            <p class="currentDegree">{{ Math.round(temp.main.temp) }}&deg;</p>
            <div>
              <img src="~assets/images/drop.png" alt="" />
              <p class="fall">{{ temp.main.humidity }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <nav>
      <i class="fas fa-home"></i>
      <i class="fas fa-search-location"></i>
      <i class="fas fa-chart-line"></i>
      <i class="fas fa-cog"></i>
    </nav>
  </div>
</template>

<script>
// import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko'); // global로 한국어 locale 사용

export default {
  data() {
    return {
      // 현재 시간을 나타내기 위한 Dayjs 플러그인 사용
      currentTime: dayjs().format('YYYY. MM. DD. ddd'),
    };
  },
  async created() {
    // 초기데이터 선언을 위한 코드 작성
    // Vuex Store의 Mutations를 호출할 때는 commit() 메서드를 사용한다.
    // Vuex Store의 Actions를 호출할 때는 dispatch() 메서드를 사용한다.
    await this.$store.dispatch('openWeatherApi/FETCH_OPENWEATHER_API'); // Vuex Store에 선언된 api 호출 완료
    const { currentTemp, currentHumidity, currentWindSpeed, currentFeelsLike } = this.$store.state.openWeatherApi.currentWeather;

    this.currentTemp = currentTemp;
    this.temporaryData[0].value = currentHumidity + '%';
    this.temporaryData[1].value = currentWindSpeed + 'm/s';
    this.temporaryData[2].value = Math.round(currentFeelsLike) + '도';
    this.arrayTemps = this.$store.state.openWeatherApi.hourlyWeather;
    this.images = this.$store.state.openWeatherApi.imagePath;
    // this.arrayIcons = this.$store.state.openWeatherApi.imagePath;
  },
  computed: {
    // 마커를 선택했을 때, 레이아웃에 보여지는 도시이름
    cityName() {
      return this.$store.state.openWeatherApi.cityName;
    },
    currentIcon() {
      return this.$store.state.openWeatherApi.currentWeather.currentIcon;
    },
    // 현재 시간에 따른 현재온도데이터
    currentTemp() {
      const { currentTemp } = this.$store.state.openWeatherApi.currentWeather;
      return currentTemp;
    },
    arrayTemps() {
      return this.$store.state.openWeatherApi.hourlyWeather;
    },
    temporaryData() {
      const { currentHumidity, currentWindSpeed, currentFeelsLike } = this.$store.state.openWeatherApi.currentWeather;

      return [
        {
          title: '습도',
          value: currentHumidity + '%',
        },
        {
          title: '풍속',
          value: currentWindSpeed + 'm/s',
        },
        {
          title: '체감온도',
          value: currentFeelsLike + '도',
        },
      ];
    },
    // 시간별 날씨 데이터에 따른 아이콘 이미지
    images() {
      return this.$store.state.openWeatherApi.images;
    },
  },
  // created() {
  //   // 초기데이터 선언을 위한 코드 작성
  //   // https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
  //   const API_KEY = '11425be0d0b12e94cacae4113da0aaa6';
  //   let lat = 37.5683;
  //   let lon = 126.9778;

  //   // get() 메서드를 통해서 우리가 필요로하는 API 데이터를 호출한다.
  //   axios
  //     .get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
  //     .then((res) => {
  //       // console.log(res);
  //       let initialWeatherData = res.data;

  //       this.cityName = initialWeatherData.name;
  //       this.currentTemp = initialWeatherData.main.temp; // 현재 시간에 따른 현재 온도
  //       this.temporaryData[0].value = initialWeatherData.main.humidity + '%'; // 습도
  //       this.temporaryData[1].value = initialWeatherData.wind.speed + 'm/s'; // 풍속
  //       this.temporaryData[2].value = Math.round(initialWeatherData.main.feels_like) + '도'; // 체감온도
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });

  //   axios
  //     .get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
  //     .then((res) => {
  //       console.log(res);

  //       // 5일간의 3시간단위 날씨정보
  //       // this.arrayTemps = res.data.list;

  //       // 24시간 이내의 데이터만 활용할 것이기 때문에 for문을 활용
  //       for (let i = 0; i < 24; i++) {
  //         this.arrayTemps[i] = res.data.list[i];
  //       }
  //       // console.log(this.arrayTemps);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // },
  methods: {
    // 타임스탬프로 변환
    Unix_timestamp(dt) {
      let date = new Date(dt * 1000);
      let hour = date.getHours().toString().padStart(2, '0');
      return hour.substring(-2) + '시';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/scss/main.scss';

.leftContainer {
  width: 324px;
  height: 700px;
  border-radius: 50px;
  background: linear-gradient(#16455f, #0e1239);
  box-shadow: 5px 5px 10px gray;

  #cityNameBox {
    width: 100%;
    height: 10%;

    .cityName {
      @include c-center;
      width: 100%;
      height: 100%;

      p {
        color: white;
        font-family: 'Poppins', sans-serif;
        line-height: 2.5;
        text-align: center;

        &:first-child {
          width: 241px;
          height: 33px;
          font-size: 1.35rem;
        }
        &:last-child {
          width: 160px;
          height: 19px;
          font-size: 0.9rem;
          font-weight: 10;
        }
      }
    }
  }

  #contentsBox {
    width: 100%;
    height: 62.5%;

    .buttonBox {
      @include center;
      width: 100%;
      height: 20%;

      .buttonBackground {
        width: 224px;
        height: 35px;
        background-color: #052137;
        border-radius: 10px;
        display: flex;

        button {
          width: 112px;
          height: 35px;
          border: 0;
          border-radius: 7.5px;
          outline: 0;
          cursor: pointer;

          &.forecast {
            background-color: #0889ff;
            color: white;
          }

          &.airquality {
            background: transparent;
            color: #467599;
          }
        }
      }
    }

    .weatherBox {
      width: 100%;
      height: 80%;

      .weatherDegree {
        @include center;
        width: 100%;
        height: 15%;

        p {
          font-size: 3.5rem;
          font-weight: 500;
          font-family: 'Be Vietnam Pro', sans-serif;
          color: white;
        }
      }
    }

    .weatherIcon {
      @include center;
      width: 100%;
      height: 60%;

      img {
        height: 160px;
      }
    }

    .weatherData {
      display: flex;
      width: 100%;
      height: 25%;

      .detailData {
        @include c-center;
        width: 33.33%;
        height: 100%;
        // 레이아웃이 3개이기 때문에 동일한 레이아웃을 반복시킴
        &:nth-child(1) {
          margin-left: 10px;
        }
        &:nth-child(2) {
          margin-left: 0 -10px;
        }
        &:nth-child(3) {
          margin-right: 10px;
        }

        p {
          line-height: 1.5;
          color: white;

          &:first-child {
            font-size: 1rem;
            font-weight: 300;
            font-family: 'Noto Sans KR', sans-serif;
            color: #799ed0;
          }

          &:last-child {
            font-size: 1rem;
            font-weight: 200;
            font-family: 'Poppins', sans-serif;
          }
        }
      }
    }
  }

  #todayWeather {
    width: 100%;
    height: 17.5%;

    .textBox {
      @include center-sb;
      width: calc(100% - 70px);
      height: 35%;
      padding: 0 35px;
      font-family: 'Noto Sans KR', sans-serif;

      p {
        font-weight: 400;
        font-size: 0.8rem;
        color: white;
        text-align: center;

        &:last-child {
          font-weight: 400;
          font-size: 0.8rem;
          color: #0085ff;
          cursor: pointer;
          margin-bottom: 2px;
        }
      }
    }
    .timelyWeatherBox {
      display: flex;
      align-items: center;
      width: calc(100% -70px);
      height: 65%;
      padding: 0 30px;
      overflow-x: scroll;
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */
      &::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera*/
      }

      .timelyWeather {
        display: flex;
        width: 126px;
        min-width: 126px;
        height: 70px;
        background-color: #0989ff;
        border-radius: 20px;
        margin-right: 15px;

        &:first-child {
          margin-left: 0;
        }

        .icon {
          @include center;
          width: 45%;
          height: 100%;

          img {
            width: 100%;
          }
        }

        .data {
          @include c-center-se;
          width: 55%;
          height: 100%;

          p {
            color: whitesmoke;
            font-family: 'Poppins', sans-serif;
            text-align: center;

            &.time {
              font-size: 0.8rem;
              font-weight: 200;
              margin-top: 7.5px;
            }

            &.currentDegree {
              font-size: 1.2rem;
              margin-top: 7.5px;
            }
          }

          div {
            @include center;
            width: 100%;
            height: 33.33%;

            img {
              height: 55%;
            }

            .fall {
              font-size: 0.9re;
              margin-top: 1.5px;
            }
          }
        }
      }
    }
  }

  nav {
    @include center-sb;
    width: calc(100% - 100px);
    height: 10%;
    padding: 0 50px;

    i {
      color: rgb(255, 255, 255);
      font-size: 1.15rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: #799ed6;
      }
    }
  }
}
</style>
