<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <!-- 全局组件-第三方树形表格 -->
      <tree-table class="tree-table" :data="catelist" :columns="columns"
      :selection-type="false" :expand-type="false"
      show-index index-text="#" border :show-row-hover="false">
      <!-- 是否有效 列-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen;" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>
      <!-- 排序 列-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 列 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="editCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

    </el-card>

    <!-- 添加分类按钮的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:" >
          <!-- options 指定数据源 ， props 指定配置对象 -->
          <el-cascader ref="clearCascader" expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑 按钮的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%">
      <!-- 添加分类的表单 -->
      <el-form ref="editCateFormRef" :model="editCateForm" label-width="100px" :rules="editCateFormRules">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数， 用于分页
      total: 0,

      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为 模板
          type: 'template',
          // 表示当前列所使用的 模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为 模板
          type: 'template',
          // 表示当前列所使用的 模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为 模板
          type: 'template',
          // 表示当前列所使用的 模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 控制[编辑]分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 编辑分类 表单的数据对象
      editCateForm: {
        cat_name: '',
        cat_id: 0
      },
      // 编辑分类 表单的验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }

    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      // console.log(res)
      // 把获取到的数据列表赋值给catelist
      this.catelist = res.data.result
      // 为总数据条数赋值, 用于分页
      this.total = res.data.total
    },

    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮显示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        // eslint-disable-next-line
        return
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        }

        this.$message.success('添加分类成功!')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听 添加分类对话框的关闭事件,重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      // 级联选择器el-cascader没有resetFields，以下是两种方法
      /* this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0 */
      // 清空级联选择器的第二种方法
      const obj = {}
      obj.stopPropagation = () => {}
      try {
        this.$refs.clearCascader.clearValue(obj)
      } catch (err) {
        this.$refs.clearCascader.handleClear(obj)
      }
    },

    // 点击 编辑 按钮，打开编辑页面表单
    async editCateDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('获取分类名称失败!')
      }

      // 将服务器响应的 cat_id 和 cat_name 赋值到 editeCateFrom 表单数据对象
      this.editCateForm.cat_id = res.data.cat_id
      this.editCateForm.cat_name = res.data.cat_name

      // 点击 编辑 按钮， 显示编辑对话框
      this.editCateDialogVisible = true
    },

    // 编辑 分类 表单提交
    async editCate() {
      const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
        cat_name: this.editCateForm.cat_name
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改分类名称失败!')
      }
      this.$message.success('修改分类名称成功!')
      // 重新获取分类列表
      this.getCateList()
      // 关闭对话框
      this.editCateDialogVisible = false
    },

    // 删除分类
    async removeCate(id) {
      const result = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
      if (result === 'confirm') {
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败!')
        }
        this.$message.success('分类删除成功!')
        // 重新获取分类列表
        this.getCateList()
      }
    }
  }
}
</script>

<style lang="less" scoped>

.tree-table {
  margin-top: 15px;
  // 隐藏表格内右侧的滚动条scroll 以下分别是ie10+, firefox的写法
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;
   // webkit写法， 这里::-webkit-scrollbar是嵌套，相当于.tree-table ::-webkit-scrollbar ，中间必须有空格
  ::-webkit-scrollbar {
    width: 0 !important;
  }
}
.el-cascader {
  width: 100%;
}
</style>
