<?php

namespace App\Filament\Resources\Challenges\Tables;

use App\Models\Challenge;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Unit;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Actions\BulkAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class ChallengesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('lesson.unit.course.title')
                    ->label('Course')
                    ->searchable()
                    ->sortable()
                    ->toggleable(),
                    
                TextColumn::make('lesson.unit.title')
                    ->label('Unit')
                    ->searchable()
                    ->sortable()
                    ->toggleable(),
                    
                TextColumn::make('lesson.title')
                    ->label('Lesson')
                    ->searchable()
                    ->sortable(),
                    
                TextColumn::make('type')
                    ->searchable()
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'select' => 'success',
                        'match' => 'info',
                        'fill-blank' => 'warning',
                        'listen' => 'danger',
                        'speak' => 'primary',
                        'arrange' => 'secondary',
                        default => 'gray',
                    }),
                    
                TextColumn::make('question')
                    ->limit(30)
                    ->searchable(),
                    
                TextColumn::make('order')
                    ->numeric()
                    ->sortable(),
                    
                TextColumn::make('audio_src')
                    ->toggleable(isToggledHiddenByDefault: true),
                    
                ImageColumn::make('image_src')
                    ->getStateUsing(function ($record) {
                        $p = ltrim((string)($record->image_src ?? ''), '/');
                        if ($p === '') return $p;
                        if (str_starts_with($p, 'storage/')) $p = substr($p, 8);
                        if (str_starts_with($p, 'public/')) $p = substr($p, 7);
                        return '/storage/' . ltrim($p, '/');
                    })
                    ->toggleable(),
                    
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                    
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('course_id')
                    ->label('Course')
                    ->relationship('lesson.unit.course', 'title')
                    ->searchable()
                    ->preload(),
                    
                SelectFilter::make('unit_id')
                    ->label('Unit')
                    ->relationship('lesson.unit', 'title')
                    ->searchable()
                    ->preload(),
                    
                SelectFilter::make('lesson_id')
                    ->label('Lesson')
                    ->relationship('lesson', 'title')
                    ->searchable()
                    ->preload(),
                    
                SelectFilter::make('type')
                    ->label('Type')
                    ->options([
                        'select' => 'Select',
                        'match' => 'Match',
                        'fill-blank' => 'Fill in the blank',
                        'listen' => 'Listen',
                        'speak' => 'Speak',
                        'arrange' => 'Arrange',
                    ]),
            ])
            ->defaultSort('lesson_id', 'asc')
            ->additionalSort('order', 'asc')
            ->reorderable('order')
            ->reorderRecordsTriggerAction(
                fn (BulkAction $action, Table $table) => $action
                    ->label('Reorder challenges')
                    ->modalHeading('Reorder challenges')
                    ->modalDescription('Drag and drop the challenges to reorder them within their lesson.')
                    ->modalSubmitActionLabel('Reorder')
                    ->modalCancelActionLabel('Cancel')
                    ->action(function (Collection $records, array $data) {
                        // Group records by lesson_id and maintain order within each lesson
                        $recordsByLesson = $records->groupBy('lesson_id');
                        
                        foreach ($recordsByLesson as $lessonId => $lessonChallenges) {
                            $lessonChallenges->sortBy('order')->values()->each(function ($challenge, $index) {
                                $challenge->update(['order' => $index + 1]);
                            });
                        }
                    })
            )
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    BulkAction::make('renumber_order')
                        ->label('Renumber order')
                        ->icon('heroicon-o-arrow-path')
                        ->color('warning')
                        ->action(function (Collection $records) {
                            // Group by lesson and renumber sequentially
                            $recordsByLesson = $records->groupBy('lesson_id');
                            
                            foreach ($recordsByLesson as $lessonId => $lessonChallenges) {
                                $lessonChallenges->sortBy('order')->values()->each(function ($challenge, $index) {
                                    $challenge->update(['order' => $index + 1]);
                                });
                            }
                        })
                        ->requiresConfirmation()
                        ->modalDescription('This will renumber the selected challenges sequentially within each lesson, starting from 1.')
                        ->deselectRecordsAfterCompletion(),
                ]),
            ]);
    }
}
