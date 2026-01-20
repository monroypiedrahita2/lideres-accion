import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

export const emailVerifiedGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastrService);

    const user = auth.getAuth().currentUser;

    if (auth.isEmailVerified(user)) {
        return true;
    }

    if (user) {
        toast.warning('Por favor verifica tu correo electrónico para acceder.');
    }

    router.navigate(['/public/login']);
    return false;
};
