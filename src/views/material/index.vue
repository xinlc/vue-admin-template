<template>
  <div class="app-container">
    <div class="filter-container">

      <!-- header -->
      <div style="display: inline-block;">
        <label class="radio-label" style="padding-left:0;">食材种类</label>
        <el-select v-model="listQuery.categoryId" placeholder="- 请选择 -" clearable style="width: 120px" class="filter-item">
          <el-option v-for="item in categoryOptions" :key="item.id" :label="item.materialTypeName" :value="item.id" />
        </el-select>
      </div>
      <div style="display: inline-block;">
        <label class="radio-label" style="padding-left:0;">食材名称</label>
        <el-input v-model="listQuery.name" placeholder="请输入食材名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      </div>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        立即查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button> -->
    </div>

    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="食品名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.materialOtherName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="食材种类" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.materialType | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.materialDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button size="mini" type="danger" @click="debounceDeleteData(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加、修改 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" class="material-dialog material-kuang">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" style="width: 600px; margin-left:50px;">
        <el-form-item label="食材名称" prop="title" class="material-shicai">
          <!-- <el-input v-model="temp.title" style="width:195px;" placeholder="5个字以内" /> -->
          <el-autocomplete v-model="temp.title" :fetch-suggestions="querySearchAsync" placeholder="5个字以内" @select="handleSelect" />
        </el-form-item>
        <el-form-item label="食材种类" prop="type" class="material-shicai">
          <el-select v-model="temp.categoryId" class="filter-item" placeholder="- 请选择 -">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.materialTypeName" :value="item.id" />
          </el-select>
        </el-form-item>
        <!--
        <el-form-item label="时间" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
        </el-form-item>

        <el-form-item label="模糊查询">
           <el-autocomplete v-model="state" :fetch-suggestions="querySearchAsync" placeholder="请输入内容" @select="handleSelect"></el-autocomplete>
        </el-form-item>
       -->
        <el-form-item label="备注" class="material-beizhu">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="可选填备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?debounceCreateData():debounceUpdateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchList, fetchCategoryList,
  searchMaterial, fetchMaterial,
  createMaterial, updateMaterial, delMaterial
} from '@/api/material'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import debounce from 'throttle-debounce/debounce'

let categoryTypeKeyValue = {}

export default {
  name: 'MaterialIndex',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return categoryTypeKeyValue[type]
    }
  },
  data() {
    const validateTitle = (rule, value, callback) => {
      if (!value) {
        callback(new Error('不能为空'))
      } else {
        if (this.oldTemp.title === value) {
          callback()
        } else {
          const categoryId = this.temp.categoryId || 9 // 9 其他
          fetchMaterial(value, categoryId).then(response => {
            const result = response.data
            if (result && result.length > 0) {
              callback(new Error('该食材已存在'))
            }
            callback()
          })
        }
      }
    }
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        name: undefined,
        categoryId: undefined,
        sort: '+id'
      },
      categoryOptions: [],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        id: undefined,
        materialId: undefined,
        title: '',
        categoryId: '',
        remark: ''
      },
      oldTemp: { // 修改时 做对此
        title: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '新增'
      },
      rules: {
        title: [{ required: true, trigger: 'blur', validator: validateTitle }],
        categoryId: [{ required: true, message: '不能为空', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.debounceCreateData = debounce(3000, true, index => {
      this.createData()
    })
    this.debounceUpdateData = debounce(3000, true, index => {
      this.updateData()
    })
    this.debounceDeleteData = debounce(1000, true, data => {
      this.handleDelete(data)
    })
    this.getCategoryList()
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.count
        this.listLoading = false
      })
    },
    getCategoryList() {
      fetchCategoryList().then(response => {
        this.categoryOptions = response.data

        // arr to obj, such as { 1 : "肉类" }
        categoryTypeKeyValue = this.categoryOptions.reduce((acc, cur) => {
          acc[cur.id] = cur.materialTypeName
          return acc
        }, {})
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        materialId: undefined,
        title: '',
        categoryId: '',
        remark: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const { materialId, title, categoryId, remark } = this.temp
          const data = {
            materialId,
            materialOtherName: title,
            materialType: categoryId,
            materialDesc: remark
          }
          createMaterial(data).then(() => {
            // this.list.unshift(data)
            this.dialogFormVisible = false
            this.$notify({
              title: '通知',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            // 刷新
            this.handleFilter()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = {
        id: row.id,
        materialId: undefined,
        title: row.materialOtherName,
        categoryId: row.materialType,
        remark: row.materialDesc
      }
      this.oldTemp = {
        title: row.materialOtherName
      }
      // Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const { id, materialId, title, categoryId, remark } = this.temp
          const data = {
            id,
            materialId,
            materialOtherName: title,
            materialType: categoryId,
            materialDesc: remark
          }
          updateMaterial(data).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '通知',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
            // 刷新
            this.handleFilter()
          })
        }
      })
    },
    handleDelete(row) {
      delMaterial(row.id).then(() => {
        // const index = this.list.indexOf(row)
        // this.list.splice(index, 1)
        this.$notify({
          title: '通知',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        // 刷新
        this.handleFilter()
      })
    },
    querySearchAsync(queryString, cb) {
      if (queryString) {
        searchMaterial(queryString).then(response => {
          const results = response.data.map((n) => {
            return {
              ...n,
              value: n.materialName
            }
          })
          cb(results)
        })
      } else {
        cb([])
      }
    },
    handleSelect(item) {
      // {"id":48,"materialName":"冻分割大猪肉","materialPiyin":"dfgdzr","materialCode":"21114015","materialUnit":"kg","materialWeight":0.00,"materialType":9,"materialDesc":""}
      this.temp = {
        ...this.temp,
        materialId: item.id,
        title: item.materialName,
        categoryId: item.materialType,
        remark: item.materialDesc
      }
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>

<style scoped>
.radio-label {
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 30px;
}
.filter-container {
  padding-bottom: 20px;
}
.filter-item {
  margin-bottom: 0px;
}
.m-bottom-10 {
  margin-bottom: 10px;
}
</style>

<style>
.material-dialog .el-dialog__header {
  padding: 20px;
  padding-bottom: 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}
.material-shicai .el-form-item__label {
  width: 90px;
}
.material-beizhu .el-form-item__label {
  width: 80px;
  margin-left:10px;
  padding-right:0px;
}

.material-beizhu .el-form-item__content {
  margin-left:86px;
}
.material-beizhu .el-input--medium {
  width: 85%;
}

</style>
