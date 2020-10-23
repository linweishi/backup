<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告 -->
      <el-alert
        title="注意: 只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
            style="width: 260px;"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页切换区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加参数</el-button>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
           <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加属性</el-button>
        </el-tab-pane>
      </el-tabs>

    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择器的配置参数
      cateProps: {
        // 次级菜单的展开方式
        expandTrigger: 'hover',
        // 选项的值
        value: 'cat_id',
        // 选项标签的名称
        label: 'cat_name',
        // 选项的子选项所对应的属性值
        children: 'children'
      },
      // 级联选择框选中后的数据双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的tab页名称
      activeName: 'many'

    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }

      this.catelist = res.data
    },
    // 级联选择框选项变化所触发的函数
    async handleChange() {
      // 如果选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        // eslint-disable-next-line
        return
      }
      // 选中的是三级分类
      console.log(this.selectedCateKeys)
      // 根据所选分类的Id, 和当前所处的面板,获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })

      if (res.meta.status !== 200) {
        return this.$message.error('获取列表参数失败!')
      }

      console.log(res.data)
    },

    // tab 页签点击事件的处理函数
    handleTabClick() {
      console.log(this.activeName)
    }

  },
  computed: {
    // 如果按钮需要被禁用, 则返回true, 否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的Id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

</style>
