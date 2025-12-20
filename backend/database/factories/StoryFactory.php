<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Story>
 */
class StoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $travelTitles = [
            'Exploring the Ancient Streets of Rome',
            'Coffee Culture in the Heart of Istanbul',
            'Safari Adventure in the Serengeti',
            'Hidden Gems of Barcelona\'s Gothic Quarter',
            'Mountain Trekking in the Swiss Alps',
            'Sunset at Santorini: A Greek Paradise',
            'Tokyo\'s Neon Lights and Ancient Temples',
            'Wandering Through the Canals of Venice',
            'Desert Dunes and Bedouin Camps in Morocco',
            'Discovering the Temples of Bali',
        ];

        $travelDescriptions = [
            'Had an incredible time exploring this amazing destination. The local culture, food, and scenery exceeded all expectations. Highly recommend adding this to your bucket list!',
            'This place is pure magic. Every corner reveals a new adventure. Met wonderful locals, tasted authentic cuisine, and created memories that will last a lifetime.',
            'A journey of a lifetime! The landscapes are breathtaking, the people are incredibly welcoming, and the experiences are unforgettable. Already planning my return trip!',
            'Adventure at its finest! This destination offers everything from natural wonders to cultural treasures. A must-visit for any travel enthusiast.',
            'Simply stunning! The combination of history, culture, and natural beauty makes this one of the most special places I\'ve visited. Worth every moment.',
        ];

        $locations = [
            'Rome, Italy',
            'Istanbul, Turkey',
            'Arusha, Tanzania',
            'Barcelona, Spain',
            'Interlaken, Switzerland',
            'Santorini, Greece',
            'Tokyo, Japan',
            'Venice, Italy',
            'Marrakech, Morocco',
            'Ubud, Bali',
        ];

        return [
            'user_id' => User::factory(),
            'title' => $this->faker->randomElement($travelTitles),
            'content' => $this->faker->randomElement($travelDescriptions) . "\n\n" . $this->faker->paragraph(),
            'image' => $this->faker->imageUrl(800, 600, 'travel', true),
            'location' => $this->faker->randomElement($locations),
            'is_published' => true,
            'published_at' => $this->faker->dateTimeBetween('-60 days', 'now'),
        ];
    }
}
