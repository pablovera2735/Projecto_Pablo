<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CustomResetPassword extends Mailable
{
    use Queueable, SerializesModels;

    public $token;

    /**
     * Create a new message instance.
     *
     * @param string $token
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        // Correo en formato HTML
        $htmlContent = "
            <h1>Recuperación de Contraseña</h1>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Este es tu token de recuperación:</p>
            <p><strong>{$this->token}</strong></p>
            <p>Usa este token en la aplicación para restablecer tu contraseña.</p>
        ";

        return $this->subject('Recuperación de Contraseña')
                    ->html($htmlContent);  // Usamos HTML directamente
    }
}
