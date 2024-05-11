<template>
  <div class="rightContainer">
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
        <div class="airCondition">
          <p>{{ felling }}</p>
        </div>
        <div class="detail">
          <div class="title">
            <p>Detail Tenperatures</p>
          </div>
          <div class="data" v-for="(detailData, index) in subWeatherData" :key="index">
            <div class="dataName">
              <p></p>
              <p>{{ detailData.name }}</p>
            </div>
            <div class="dataValue">
              <p>{{ detailData.value }}<span></span></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Map />

    <nav>
      <i class="fas fa-home"></i>
      <i class="fas fa-search-location"></i>
      <i class="fas fa-chart-line"></i>
      <i class="fas fa-cog"></i>
    </nav>
  </div>
</template>

<script>
import Map from '~/components/Map.vue';
import { computed, onMounted, ref, watchEffect } from 'vue';
// import axios from 'axios';
import { useStore } from 'vuex';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko'); // global로 한국어 locale 사용

export default {
  components: {
    Map,
  },
  // Vue3 CompositionAPI 사용
  setup() {
    // 화면에 보여질 데이터
    let currentTime = dayjs().format('YYYY. MM. DD. ddd'); // 현재 시간을 보여주는 데이터
    let cityName = ref(''); // 도시 이름을 나타내는 데이터
    let felling = ref(''); // 현재 온도에 대한 체감을 나타내는 데이터
    let subWeatherData = ref([]);

    // OpenWeatherAPI 호출 함수
    const store = useStore();
    const fetchOpenWeatherApi = async () => {
      // API 호출을 위한 필수 데이터
      // const API_KEY = '11425be0d0b12e94cacae4113da0aaa6';
      // let lat = 37.5683;
      // let lon = 126.9778;

      // 타임스탬프로 변환
      const Unix_timestamp = (dt) => {
        let date = new Date(dt * 1000);
        let hour = date.getHours().toString().padStart(2, '0');
        return hour.substring(-2) + '시';
      };

      try {
        // const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        // console.log(res);
        await store.dispatch('openWeatherApi/FETCH_OPENWEATHER_API');
        const { currentFeelsLike, currentSunrise, currentSunset, currentVisibility } = store.state.openWeatherApi.currentWeather;

        // let isInitialData = res.data; 초기데이터
        let isInitialCityName = store.state.openWeatherApi.cityName; // 초기 도시이름 데이터
        let isFeelLikeTemp = computed(() => {
          return currentFeelsLike;
        }); // 초기 체감온도 데이터
        let isTimeOfSunrise = computed(() => {
          return currentSunrise;
        }); // 일출시간 데이터
        let isTimeOfSunSet = computed(() => {
          return currentSunset;
        }); // 일몰시간 데이터
        let isLineOfSight = computed(() => {
          return currentVisibility;
        }); // 가시거리 데이터

        // if (isFeelLikeTemp > 30) felling.value = '매우 더움';
        // if (isFeelLikeTemp < 30) felling.value = '더움';
        // if (isFeelLikeTemp < 25) felling.value = '보통';
        // if (isFeelLikeTemp < 20) felling.value = '선선함';
        // if (isFeelLikeTemp < 15) felling.value = '쌀쌀함';
        // if (isFeelLikeTemp < 10) felling.value = '추움';
        // if (isFeelLikeTemp < 0) felling.value = '매우 추움';

        const tempPoints = [0, 10, 15, 20, 25, 30];
        const lavels = ['매우추움', '추움', '쌀쌀함', '선선한', '보통', '더움', '매우더움'];

        let index = 0;
        for (const point of tempPoints) {
          if (isFeelLikeTemp.value < point) break;
          index++;
        }
        felling.value = lavels[index];

        // 가공할 or 가공한 데이터를 가지고 새로운 배열을 생성
        // 우리가 새로운 배열을 만들어주는 이유는 template 부분에서 v-for를 좀 더 편하게 쓰기 위해서
        let isProcessedData = [
          { name: '일출시간', value: Unix_timestamp(isTimeOfSunrise.value) },
          { name: '일몰시간', value: Unix_timestamp(isTimeOfSunSet.value) },
          { name: '가시거리', value: isLineOfSight.value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',') + 'M' },
        ];

        // Composition API에서 AJAX 요청과 데이터 변경을 하려면 데이터.value로 접금해야 한다.
        cityName.value = isInitialCityName;
        subWeatherData.value = isProcessedData;
      } catch (err) {
        console.log(err);
      }
    };

    watchEffect(async () => {
      await fetchOpenWeatherApi();
    })

    // 함수호출
    // fetchOpenWeatherApi();
    onMounted(() => {
      fetchOpenWeatherApi();
    });

    return {
      currentTime,
      cityName,
      felling,
      subWeatherData,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '~/scss/main.scss';

.rightContainer {
  // width: 40%;
  // height: 100%;
  width: 324px;
  min-width: 324px;
  height: 700px;
  border-radius: 50px;
  background: linear-gradient(#cb0000, #0e1239);
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
          font-weight: 100;
        }
      }
    }
  }

  #contentsBox {
    width: 100%;
    height: calc(45% - 16px);
    margin-top: 16px;

    .buttonBox {
      @include center;
      width: 100%;
      height: 20%;

      .buttonBackground {
        width: 224px;
        height: 35px;
        background-color: #370505;
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
            background-color: transparent;
            color: #a52727;
          }
          &.airquality {
            background: #ff0000;
            color: white;
          }
        }
      }
    }
    .weatherBox {
      width: 100%;
      height: 80%;

      .airCondition {
        @include center;
        width: 100%;
        height: 35%;

        p {
          text-align: center;
          font-size: 2.25rem;
          font-weight: 500;
          font-family: 'GmarketSansBold';
          color: #fff;
        }
      }
      .detail {
        width: 100%;
        height: 65%;

        .title {
          @include center;
          width: 100%;
          height: 25%;
          color: white;

          p {
            font-family: 'LeferiPoint-WhiteObliqueA';
          }
        }
        .data {
          display: flex;
          width: 100%;
          height: 27.5%;
          // background-color: rgb(187, 127, 255);

          .dataName {
            display: flex;
            align-items: center;
            width: 50%;
            height: 100%;
            font-family: 'LeferiPoint-WhiteObliqueA';

            p {
              &:first-child {
                display: block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: #ffde23;
                margin-left: 50px;
              }
              &:last-child {
                margin-left: 10px;
                color: white;
                font-weight: 300;
                font-size: 0.9rem;
              }
            }
          }
          .dataValue {
            display: flex;
            align-items: center;
            justify-content: right;
            width: 50%;
            height: 100%;
            font-family: 'LeferiPoint-WhiteObliqueA';

            p {
              color: white;
              font-weight: 300;
              margin-right: 50px;

              span {
                font-weight: 600;
              }
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
        color: #799ed0;
      }
    }
  }
}
</style>
