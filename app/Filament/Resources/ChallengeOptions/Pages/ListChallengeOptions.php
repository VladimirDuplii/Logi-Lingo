<?php

namespace App\Filament\Resources\ChallengeOptions\Pages;

use App\Filament\Resources\ChallengeOptions\ChallengeOptionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListChallengeOptions extends ListRecords
{
    protected static string $resource = ChallengeOptionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
