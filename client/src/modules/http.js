import axios from 'axios'
import {server} from '../modules/server'

export const http = axios.create({
  baseURL: server,
  timeout: 5000
});
