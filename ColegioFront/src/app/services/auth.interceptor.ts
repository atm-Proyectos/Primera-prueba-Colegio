import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

        // LOG 1: Verificar que el interceptor "ve" la petición
        console.log('🔄 [Interceptor] Petición saliente a:', request.url);

        // 1. Buscamos el token en el LocalStorage
        const token = localStorage.getItem('token');

        // LOG 2: Verificar si encontramos el token
        console.log('🔑 [Interceptor] Token en LocalStorage:', token ? 'ENCONTRADO (Oculto por seguridad)' : 'NO ENCONTRADO');

        if (token) {
            // 2. Si existe, clonamos la petición y le pegamos el Token en la cabecera
            const cloned = request.clone({
                headers: request.headers.set('Authorization', `Bearer ${token}`)
            });

            // LOG 3: Confirmar que estamos enviando la petición clonada con Auth
            console.log('✅ [Interceptor] Enviando petición CON cabecera Authorization.');

            // 3. Enviamos la petición clonada
            return next.handle(cloned);
        }

        // LOG 4: Aviso de que la petición se va "desnuda" (sin token)
        console.warn('⚠️ [Interceptor] Enviando petición SIN token (Original).');

        // Si no hay token, enviamos la petición original
        return next.handle(request);
    }
}