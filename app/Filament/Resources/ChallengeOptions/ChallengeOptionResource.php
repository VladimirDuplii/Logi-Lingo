<?php

namespace App\Filament\Resources\ChallengeOptions;

use App\Filament\Resources\ChallengeOptions\Pages\CreateChallengeOption;
use App\Filament\Resources\ChallengeOptions\Pages\EditChallengeOption;
use App\Filament\Resources\ChallengeOptions\Pages\ListChallengeOptions;
use App\Filament\Resources\ChallengeOptions\Schemas\ChallengeOptionForm;
use App\Filament\Resources\ChallengeOptions\Tables\ChallengeOptionsTable;
use App\Models\ChallengeOption;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class ChallengeOptionResource extends Resource
{
    protected static ?string $model = ChallengeOption::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedListBullet;

    protected static ?string $recordTitleAttribute = 'title';
    
    protected static ?int $navigationSort = 5;
    
    protected static string|UnitEnum|null $navigationGroup = 'Курси';
    
    protected static ?string $navigationLabel = 'Варіанти відповідей';

    public static function form(Schema $schema): Schema
    {
        return ChallengeOptionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ChallengeOptionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListChallengeOptions::route('/'),
            'create' => CreateChallengeOption::route('/create'),
            'edit' => EditChallengeOption::route('/{record}/edit'),
        ];
    }
}
