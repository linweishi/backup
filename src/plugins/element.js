import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 将Message弹框提示全局挂载到 Vue， $message 为自定义属性
Vue.prototype.$message = Message
