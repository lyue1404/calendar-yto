import { get, post } from '../axios/http.js';

export const getTaskCount = (startDate, endDate) => {
  return get( `/calendar/capi/task/taskCount?startDate=${startDate}&endDate=${endDate}`);
};

export const getSelDateTaskInfo = (setDate) => {
  return get( `/calendar/capi/task/queryTask?setDate=${setDate}`);
}

export const getRemindTimeList = () => {
  return get( `/calendar/all/dict/dictList?dictType=remind_time_type`);
}

export const addNewRemind = (remindInfo) => {
  return post( `/calendar/capi/task/addTask`, remindInfo);
}

export const getTheHoliday = (selDate) => {
  return get( `/calendar/all/holiday/holByDate?date=${selDate}`);
}

export const delRemind = (id) => {
  return post( `/calendar/capi/task/delTask`, { id });
}

export const getRemindDetail = (id) => {
  return get( `/calendar/capi/task/taskDetail?id=${id}`);
}

export const modifyRemind = (remindInfo) => {
  return post( `/calendar/capi/task/updateTask`, remindInfo);
}

