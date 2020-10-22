import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入第三方树形表格依赖
import TreeTable from 'vue-table-with-tree-grid'

// 导入Axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// 在挂载之前先设置拦截请求器，对请求做预处理，带上token值用于除登录之外的接口授权验证
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
}, error => {
  return Promise.reject(error)
})
// 将axios全局挂载到Vue
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 将第三方树形表格注册为全局组件
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
