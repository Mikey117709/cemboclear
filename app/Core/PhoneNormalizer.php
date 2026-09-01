<?php
declare(strict_types=1);

namespace App\Core;



class PhoneNormalizer
{
    

    public static function extractBase(string $phone): ?string
    {
        

        $digits = preg_replace('/\D/', '', $phone);
        if ($digits === null || $digits === '') {
            return null;
        }

        

        $base = null;
        if (str_starts_with($digits, '639') && strlen($digits) === 12) {
            $base = substr($digits, 2); 

        } elseif (str_starts_with($digits, '09') && strlen($digits) === 11) {
            $base = substr($digits, 1); 

        } elseif (str_starts_with($digits, '9') && strlen($digits) === 10) {
            $base = $digits;
        }

        return $base;
    }

    

    public static function isValid(?string $phone): bool
    {
        if ($phone === null || trim($phone) === '') {
            return false;
        }
        return self::extractBase($phone) !== null;
    }

    

    public static function toE164(string $phone): string
    {
        $base = self::extractBase($phone);
        if ($base !== null) {
            return '+63' . $base;
        }
        return trim($phone);
    }

    

    public static function toNational(string $phone): string
    {
        $base = self::extractBase($phone);
        if ($base !== null) {
            return '0' . $base;
        }
        return trim($phone);
    }

    

    public static function getVariations(string $phone): array
    {
        $raw = trim($phone);
        $variations = [$raw];

        $cleaned = preg_replace('/[^\d+]/', '', $raw);
        if ($cleaned) {
            $variations[] = $cleaned;
        }

        $base = self::extractBase($raw);
        if ($base !== null) {
            $variations[] = $base;            

            $variations[] = '0' . $base;       

            $variations[] = '+63' . $base;     

            $variations[] = '63' . $base;      

        }

        return array_values(array_unique(array_filter($variations)));
    }
}
