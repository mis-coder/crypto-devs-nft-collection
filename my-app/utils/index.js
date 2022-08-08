import { toast } from "react-toastify"

export const showToast = (type, message) => {
    const toastOptions = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    }
         switch(type){
            case 'error': toast.error('Something went wrong', {...toastOptions});
            case 'success': toast.success(message, toastOptions);
         }
}