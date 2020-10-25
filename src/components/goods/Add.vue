<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
          <!-- 提示区域 -->
           <el-alert title="添加商品信息" type="info" :closable="false" center show-icon></el-alert>
           <!-- 步骤条区域 -->
           <!-- activeIndex - 0 隐式转换为数值 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
              <el-step title="基本信息"></el-step>
              <el-step title="商品参数"></el-step>
              <el-step title="商品属性"></el-step>
              <el-step title="商品图片"></el-step>
              <el-step title="商品内容"></el-step>
              <el-step title="完成"></el-step>
            </el-steps>

            <!-- tab栏区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
              <el-tabs :tab-position="'left'" v-model="activeIndex">
                <el-tab-pane label="基本信息" name="0">
                  <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="addForm.goods_name"></el-input>
                  </el-form-item>
                  <!-- type="number"限制只能输入数字类型 -->
                  <el-form-item label="商品价格" prop="goods_price" type="number">
                    <el-input v-model="addForm.goods_price"></el-input>
                  </el-form-item>
                  <el-form-item label="商品重量" prop="goods_weight" type="number">
                    <el-input v-model="addForm.goods_weight"></el-input>
                  </el-form-item>
                  <el-form-item label="商品数量" prop="goods_number" type="number">
                    <el-input v-model="addForm.goods_number"></el-input>
                  </el-form-item>
                  <el-form-item label="商品分类" prop="goods_cat">
                    <!-- 级联选择器-商品分类列表 -->
                    <el-cascader
                      v-model="addForm.goods_cat"
                      :options="catelist"
                      :props="cateProps"
                      @change="handleChange">
                    </el-cascader>
                  </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">商品参数</el-tab-pane>
                <el-tab-pane label="角色属性" name="2">角色属性</el-tab-pane>
                <el-tab-pane label="商品图片" name="3">商品图片</el-tab-pane>
                <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
              </el-tabs>
            </el-form>

        </el-card>
    </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: []
      },
      // 表单校验规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      catelist: [],
      // 级联选择器的配置
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类数据失败!')
      }

      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器选中项变化，会触发这个函数
    handleChange() {
      console.log(this.addForm.goods_cat)
      // 如果没有选择三级分类，直接清空
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
