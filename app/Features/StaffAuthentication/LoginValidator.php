<?php
declare(strict_types=1);

namespace App\Features\StaffAuthentication;

use App\Core\PhoneNormalizer;

class LoginValidator
{
    

    public static function validate(array $input): array
    {
        $errors = [];

        $identifier = trim((string)($input['email'] ?? $input['phone'] ?? $input['identifier'] ?? $input['emailOrPhone'] ?? ''));
        $password = (string)($input['password'] ?? '');

        if ($identifier === '') {
            $errors[] = 'Email or Phone Number is required.';
        } else {
            

            $isEmail = (bool)filter_var($identifier, FILTER_VALIDATE_EMAIL);
            $isPhone = PhoneNormalizer::isValid($identifier);

            if (!$isEmail && !$isPhone) {
                $errors[] = 'Please enter a valid email address or Philippine mobile number (e.g. 09171234567 or +639171234567).';
            }
        }

        if ($password === '') {
            $errors[] = 'Password is required.';
        }

        return $errors;
    }
}
