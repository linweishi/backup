<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="goAddpage">添加商品</el-button>
            </el-col>
          </el-row>

          <!-- table表格区域 -->
          <el-table :data="goodslist" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="商品名称" prop="goods_name"></el-table-column>
            <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
            <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
            <el-table-column label="创建时间" prop="add_time" width="140px">
              <template slot-scope="scope">
                {{scope.row.add_time | dateFormat}}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="130px">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoodsDialog(scope.row.goods_id)"></el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页区域 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-card>

        <!-- 编辑商品列表项对话框 区域 -->
        <el-dialog
          title="编辑商品"
          :visible.sync="editGoodsDialogVisible"
          width="50%">
          <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="80px">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格"  prop="goods_name">
              <el-input v-model="editForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量"  prop="goods_number">
              <el-input v-model="editForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="editForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品介绍">
              <!-- 富文本编辑器组件 -->
            <quill-editor v-model="editForm.goods_introduce">
            </quill-editor>
            </el-form-item>
            <!-- 图片编辑组件 -->
            <el-form-item label="商品图片">
              <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :file-list="filelist"
              :headers="headerObj"
              list-type="picture">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-form-item>

          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editGoods">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 图片预览 -->
        <el-dialog
          title="图片预览"
          :visible.sync="previewVisible"
          width="50%"
        >
          <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>

    </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodslist: [],
      // 列表总数据条数
      total: 0,
      // 控制编辑商品对话框的显示与隐藏
      editGoodsDialogVisible: false,
      // 编辑商品的表单数据对象
      editForm: {},
      // 编辑商品的表单数据验证规则
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      },
      // 图片上传时所需要配置的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片列表
      filelist: [],
      // 控制图片预览框的显示与隐藏
      previewVisible: false,
      // 图片预览的图片路径
      previewPath: ''
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!')
      }

      // this.$message.success('获取商品列表成功!')
      console.log(res.data)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },

    // 用户通过下拉选择框操作选择每页展示的数据条数时触发此操作
    handleSizeChange(newSize) {
      // 将获取的每页条数 赋值给 queryInfo.pagesize，并向服务器请求最新数据进行渲染
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },

    // 用户操作切换页数时会触发此操作
    handleCurrentChange(newPage) {
      // 将取得的页数赋值给queryInfo.pagenum,重新向服务器获取返回的数据渲染出来
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 点击 编辑按钮 打开 编辑商品列表项对话框
    async editGoodsDialog(id) {
      this.filelist = []
      const { data: res } = await this.$http.get('goods/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败!')
      }
      this.editForm = res.data
      // 显示对话框
      this.editGoodsDialogVisible = true
      // 将取得的图片数组进行循环遍历，把对应属性值赋值给upload组件的file-list属性用于展示图片列表
      // file-list接收一个数组，每项的值为一个对象，包括name跟url两个属性
      this.editForm.pics.forEach((item) => {
        const filelistItem = {
          name: item.pics_big_url.slice(item.pics_big_url.lastIndexOf('/') + 1),
          url: item.pics_big_url
        }
        this.filelist.push(filelistItem)

        // 为曾经上传过的图片拼接临时路径
        const oldTmpPath = {
          pic: 'tmp_uploads\\' + item.pics_big_url.slice(item.pics_big_url.lastIndexOf('_') + 1)
        }
        this.editForm.pics.push(oldTmpPath)
      })
      console.log(this.editForm)
    },
    // 点击 删除 触发的函数
    async removeById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除!')
      }

      const { data: res } = await this.$http.delete(`goods/${id}`)

      if (res.meta.status !== '200') {
        this.$message.error('删除失败!')
      }
      this.$message.success('已成功删除该商品!')
      this.getGoodsList()
    },
    // 点击 添加商品 按钮， 跳转到商品添加页面
    goAddpage() {
      this.$router.push('/goods/add')
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 拼接得到一个图片信息对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.editForm.pics.push(picInfo)
      // console.log(this.editForm)
    },
    // 预览图片触发的事件
    handlePreview(file) {
      this.previewPath = file.url
      this.previewVisible = true
    },
    // 移除图片触发的事件
    handleRemove(file) {
      if (file.response) {
        const filePath = file.response.data.tmp_path
        // 从pics数组中，找到这个图片对应的索引值
        const i = this.editForm.pics.findIndex((x) => x.pic === filePath)
        // 调用数组的splice方法，把图片信息对象，从pics数组中移除
        this.editForm.pics.splice(i, 1)
      } else {
        const filePath = 'tmp_uploads\\' + file.name.slice(file.name.lastIndexOf('_') + 1)
        const i = this.editForm.pics.findIndex((x) => x.pic === filePath)
        // 调用数组的splice方法，把图片信息对象，从pics数组中移除
        this.editForm.pics.splice(i, 1)
      }

      console.log(this.editForm)
    },
    editGoods() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请添加必要的表单项!')
        }
        const { data: res } = await this.$http.put('goods/' + this.editForm.goods_id, {
          goods_name: this.editForm.goods_name,
          goods_price: this.editForm.goods_price,
          goods_number: this.editForm.goods_number,
          goods_weight: this.editForm.goods_weight,
          goods_introduce: this.editForm.goods_introduce,
          attrs: this.editForm.attrs
        })
        if (res.meta.status !== 201) {
          return this.$message.error('编辑商品信息失败!')
        }
        this.$message.success('编辑商品信息成功!')

        this.editGoodsDialogVisible = false
      })
    }

  }
}
</script>

<style lang="less" scoped>
.previewImg {
  width: 100%;
}
</style>
