<?php

namespace Database\Seeders;

use App\Models\Classroom;
use Illuminate\Database\Seeder;

class ClassroomSeeder extends Seeder
{
    public function run(): void
    {
        $classrooms = [
            // ==========================================
            // EDUCATION BUILDING (College of Education - COEd)
            // ==========================================
            [
                'building' => 'Education Building',
                'room_number' => '101',
                'room_name' => 'COEd Lecture Room 101',
                'capacity' => 45,
                'room_type' => 'classroom',
                'equipment' => ['projector', 'whiteboard', 'air_conditioning', 'sound_system'],
                'is_active' => true,
            ],
            [
                'building' => 'Education Building',
                'room_number' => '102',
                'room_name' => 'COEd Lecture Room 102',
                'capacity' => 45,
                'room_type' => 'classroom',
                'equipment' => ['projector', 'whiteboard', 'air_conditioning'],
                'is_active' => true,
            ],
            [
                'building' => 'Education Building',
                'room_number' => '103',
                'room_name' => 'COEd Lecture Room 103',
                'capacity' => 40,
                'room_type' => 'classroom',
                'equipment' => ['projector', 'whiteboard'],
                'is_active' => true,
            ],
            [
                'building' => 'Education Building',
                'room_number' => '104',
                'room_name' => 'COEd Lecture Room 104',
                'capacity' => 40,
                'room_type' => 'classroom',
                'equipment' => ['projector', 'whiteboard'],
                'is_active' => true,
            ],
            [
                'building' => 'Education Building',
                'room_number' => '201',
                'room_name' => 'Micro-Teaching Simulation Lab',
                'capacity' => 30,
                'room_type' => 'lab',
                'equipment' => ['video_cameras', 'smart_tv', 'observation_mirrors', 'air_conditioning'],
                'is_active' => true,
            ],
            [
                'building' => 'Education Building',
                'room_number' => '202',
                'room_name' => 'Early Childhood & SPED Resource Lab',
                'capacity' => 35,
                'room_type' => 'lab',
                'equipment' => ['learning_manipulatives', 'whiteboard', 'projector', 'air_conditioning'],
                'is_active' => true,
            ],
            [
                'building' => 'Education Building',
                'room_number' => '203',
                'room_name' => 'Educational Technology & Media Lab',
                'capacity' => 40,
                'room_type' => 'lab',
                'equipment' => ['computers', 'projector', 'interactive_whiteboard', 'air_conditioning'],
                'is_active' => true,
            ],
            [
                'building' => 'Education Building',
                'room_number' => '204',
                'room_name' => 'Curriculum & Reading Resource Room',
                'capacity' => 35,
                'room_type' => 'classroom',
                'equipment' => ['reading_stations', 'whiteboard', 'air_conditioning'],
                'is_active' => true,
            ],
            [
                'building' => 'Education Building',
                'room_number' => '301',
                'room_name' => 'COEd Audio-Visual Hall',
                'capacity' => 100,
                'room_type' => 'lecture_hall',
                'equipment' => ['dual_projectors', 'surround_sound', 'air_conditioning', 'podium_mic'],
                'is_active' => true,
            ],
            [
                'building' => 'Education Building',
                'room_number' => '302',
                'room_name' => 'Faculty & Graduate Seminar Room',
                'capacity' => 50,
                'room_type' => 'lecture_hall',
                'equipment' => ['projector', 'conference_table', 'air_conditioning', 'whiteboard'],
                'is_active' => true,
            ],

            // ==========================================
            // MAIN BUILDING & SHARED UNIVERSITY FACILITIES
            // ==========================================
            [
                'building' => 'Main Building',
                'room_number' => '101',
                'room_name' => 'General Lecture Hall A',
                'capacity' => 60,
                'room_type' => 'lecture_hall',
                'equipment' => ['projector', 'whiteboard', 'air_conditioning', 'sound_system'],
                'is_active' => true,
            ],
            [
                'building' => 'Main Building',
                'room_number' => '102',
                'room_name' => 'General Lecture Hall B',
                'capacity' => 60,
                'room_type' => 'lecture_hall',
                'equipment' => ['projector', 'whiteboard', 'air_conditioning', 'sound_system'],
                'is_active' => true,
            ],
            [
                'building' => 'Main Building',
                'room_number' => '201',
                'room_name' => 'General Academic Room 201',
                'capacity' => 45,
                'room_type' => 'classroom',
                'equipment' => ['projector', 'whiteboard'],
                'is_active' => true,
            ],
            [
                'building' => 'Main Building',
                'room_number' => '202',
                'room_name' => 'General Academic Room 202',
                'capacity' => 45,
                'room_type' => 'classroom',
                'equipment' => ['projector', 'whiteboard'],
                'is_active' => true,
            ],
            [
                'building' => 'Sports Complex',
                'room_number' => 'GYM',
                'room_name' => 'University Gymnasium (PATHFIT)',
                'capacity' => 120,
                'room_type' => 'classroom',
                'equipment' => ['sports_mats', 'sound_system', 'scoreboard'],
                'is_active' => true,
            ],
        ];

        foreach ($classrooms as $classroom) {
            Classroom::updateOrCreate(
                [
                    'building' => $classroom['building'],
                    'room_number' => $classroom['room_number'],
                ],
                $classroom
            );
        }

        $this->command->info('Classrooms seeded: '.count($classrooms).' College of Education classrooms and university lecture halls.');
    }
}
