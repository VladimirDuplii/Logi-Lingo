<?php

namespace App\Console\Commands;

use App\Models\Challenge;
use App\Models\ChallengeOption;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MigrateMediaToPublic extends Command
{
    protected $signature = 'media:migrate-to-public {--dry-run : Only report actions without changing anything}';

    protected $description = 'Move challenge and option media from private to public storage and normalize DB paths';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $this->info('Starting media migration'.($dry ? ' (dry-run)' : ''));

        $moved = 0; $normalized = 0;

        $normalizePath = function (?string $path) {
            if (!$path) return $path;
            $p = ltrim($path, '/');
            // strip known prefixes that should not be stored in DB
            if (str_starts_with($p, 'storage/')) {
                $p = substr($p, 8);
            }
            if (str_starts_with($p, 'public/')) {
                $p = substr($p, 7);
            }
            if (str_starts_with($p, 'private/')) {
                $p = substr($p, 8);
            }
            return $p;
        };

        $moveIfExists = function (string $path) use (&$moved, $dry) {
            $path = ltrim($path, '/');
            $candidates = [];
            if (str_starts_with($path, 'private/')) {
                $candidates[] = $path; // already includes private/
                $candidates[] = 'private/' . substr($path, 8); // just in case
                $targetRelative = substr($path, 8);
            } else {
                $candidates[] = 'private/' . $path; // typical case
                $targetRelative = $path;
            }

            foreach ($candidates as $privatePath) {
                if (Storage::disk('local')->exists($privatePath)) {
                    if ($dry) {
                        $this->line("Would move: storage/app/$privatePath -> storage/app/public/$targetRelative");
                    } else {
                        $data = Storage::disk('local')->get($privatePath);
                        Storage::disk('public')->put($targetRelative, $data);
                        Storage::disk('local')->delete($privatePath);
                    }
                    $moved++;
                    return true;
                }
            }
            return false;
        };

        DB::transaction(function () use ($normalizePath, $moveIfExists, &$normalized) {
            // Challenges (image/audio)
            Challenge::chunk(200, function ($chunk) use ($normalizePath, $moveIfExists, &$normalized) {
                foreach ($chunk as $c) {
                    $origImage = $c->image_src; $origAudio = $c->audio_src;
                    $img = $normalizePath($c->image_src);
                    $aud = $normalizePath($c->audio_src);
                    if ($img && $img !== $origImage) { $c->image_src = $img; $normalized++; }
                    if ($aud && $aud !== $origAudio) { $c->audio_src = $aud; $normalized++; }
                    if ($img) { $moveIfExists($img); }
                    if ($aud) { $moveIfExists($aud); }
                    if ($c->isDirty()) { $c->save(); }
                }
            });

            // Challenge options (image/audio)
            ChallengeOption::chunk(200, function ($chunk) use ($normalizePath, $moveIfExists, &$normalized) {
                foreach ($chunk as $o) {
                    $origImage = $o->image_src; $origAudio = $o->audio_src;
                    $img = $normalizePath($o->image_src);
                    $aud = $normalizePath($o->audio_src);
                    if ($img && $img !== $origImage) { $o->image_src = $img; $normalized++; }
                    if ($aud && $aud !== $origAudio) { $o->audio_src = $aud; $normalized++; }
                    if ($img) { $moveIfExists($img); }
                    if ($aud) { $moveIfExists($aud); }
                    if ($o->isDirty()) { $o->save(); }
                }
            });
        });

        $this->info("Moved files: $moved; Normalized paths: $normalized");

        return Command::SUCCESS;
    }
}
