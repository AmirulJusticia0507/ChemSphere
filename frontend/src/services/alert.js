import Swal from 'sweetalert2'

const baseOptions = {
  confirmButtonColor: '#17213d',
  cancelButtonColor: '#64748b',
  buttonsStyling: true,
}

export function showSuccess(title, text) {
  return Swal.fire({
    ...baseOptions,
    icon: 'success',
    title,
    text,
    timer: 2200,
    showConfirmButton: false,
  })
}

export function showError(text, title = 'Terjadi kesalahan') {
  return Swal.fire({ ...baseOptions, icon: 'error', title, text })
}

export async function confirmAction({
  title = 'Lanjutkan tindakan ini?',
  text,
  confirmButtonText = 'Ya, lanjutkan',
}) {
  const result = await Swal.fire({
    ...baseOptions,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#c2410c',
    confirmButtonText,
    cancelButtonText: 'Batal',
    reverseButtons: true,
    focusCancel: true,
  })
  return result.isConfirmed
}
