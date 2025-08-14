<?php

namespace App\Filament\Resources\ChallengeOptions\Pages;

use App\Filament\Resources\ChallengeOptions\ChallengeOptionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditChallengeOption extends EditRecord
{
    protected static string $resource = ChallengeOptionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
