import Vue from 'vue'
import App from './App.vue'
import { Dialog, Form, FormItem, Button, Input, Container, Header, Main, Tabs, TabPane, row, col, Loading, MessageBox} from 'element-ui'
import { Alert } from 'element-ui'
import './css/base.css'
import '../ele-theme/index.css'
import router from './router/index'

Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Button)
Vue.use(Input)
Vue.use(Container)
Vue.use(Main)
Vue.use(Header)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(row)
Vue.use(col)
Vue.use(Loading)
Vue.use(Alert)
Vue.prototype.$alert = MessageBox.alert

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
