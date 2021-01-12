import { Auth } from "aws-amplify";
import { NotificationManager } from "react-notifications";

import * as types from "../constants";
import request from "../../utils/request";
import store from "../store";
import { bugReport } from "../../utils/helper";

export function setSearchQuery(query = "") {
  store.dispatch({ payload: query, type: types.SET_SEARCH_QUERY });
}

export function setSearchOrigin(origin = "now") {
  store.dispatch({ payload: origin, type: types.SET_SEARCH_ORIGIN });
}

export function setSearchScale(scale) {
  store.dispatch({ payload: scale, type: types.SET_SEARCH_SCALE });
}

export async function getSearchResult(
  query = "",
  resultsCursor = 0,
  origin,
  scale
) {
  let token = null;
  try {
    let res = await Auth.currentSession();
    token = res.getIdToken().getJwtToken();
  } catch (err) {
    console.log(err);
    NotificationManager.error(err.message, "Error", 5000, () => {});
    bugReport(err);
  }

  const headers = { authorizer: token };
  const params = scale
    ? { q: query, cursor: resultsCursor, origin: origin, scale: scale }
    : { q: query, cursor: resultsCursor, origin: origin };

  store.dispatch({ type: types.GET_SEARCH_RESULT });
  return request()
    .post("/search", null, { params, headers })
    .then((response) => {
      console.log(response.data);
      store.dispatch({
        payload: response.data,
        type: types.GET_SEARCH_RESULT_SUCCEED,
      });
    })
    .catch(() => {
      return request()
        .post("/search", null, { params, headers })
        .then((response) => {
          console.log(response.data);
          store.dispatch({
            payload: response.data,
            type: types.GET_SEARCH_RESULT_SUCCEED,
          });
        })
        .catch((err) => {
          store.dispatch({
            payload: err.data,
            type: types.GET_SEARCH_RESULT_FAIL,
          });
          console.log(err);
          NotificationManager.error(err.message, "Error", 5000, () => {});
        });
    });
}
