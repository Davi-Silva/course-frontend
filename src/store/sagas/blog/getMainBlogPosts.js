import {
  put,
  call,
} from 'redux-saga/effects';

async function getMainBlogPostsApi() {
  const res = await fetch('http://34.196.97.115:5000/blog/home/main-post', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  return data;
}

export default function* asyncGetMainBlogPostsApi() {
  try {
    const response = yield call(getMainBlogPostsApi);

    yield put({ type: 'SUCCESS_GET_MAIN_BLOG_POSTS', payload: { data: response } });
  } catch (err) {
    yield put({ type: 'FAILURE_GET_MAIN_BLOG_POSTS' });
  }
}
