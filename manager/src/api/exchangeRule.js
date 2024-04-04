// 统一请求路径前缀在libs/axios.js中修改
import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest,
} from "@/libs/axios";

//新增规则
export const addExchangeRule = (params) => {
  return postRequest("/buyer/atm/rule", params);
};
//修改规则
export const updateExchangeRule = (params) => {
  return putRequest("/buyer/atm/rule", params);
};
//删除规则
export const deleteExchangeRule = (id) => {
  return deleteRequest(`/buyer/atm/rule/${id}`);
};
//查询最后一条规则
export const getLastExchangeRule = () => {
  return getRequest("/buyer/atm/rule/lastRule");
};
