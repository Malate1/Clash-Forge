import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import 'sweetalert2/dist/sweetalert2.min.css'

toastr.options = {
  closeButton: true,
  newestOnTop: true,
  progressBar: true,
  positionClass: 'toast-top-right',
  preventDuplicates: true,
  timeOut: 4000,
  extendedTimeOut: 1500,
}

export { default as Swal } from 'sweetalert2'

export function toastSuccess(message, title = '') {
  toastr.success(message, title)
}

export function toastError(message, title = 'Something went wrong') {
  toastr.error(message, title)
}
