# LogicLingo Database Structure

This document outlines the database structure for the LogicLingo language learning platform.

## Entity Relationship Diagram

```
erDiagram
  USERS ||--o{ CHALLENGEPROGRESS : "userId"
  USERS ||--|| USERPROGRESS : "1-to-1"
  USERS ||--|| USERSUBSCRIPTION : "1-to-1"

  COURSES ||--o{ UNITS : "courseId"
  UNITS ||--o{ LESSONS : "unitId"
  LESSONS ||--o{ CHALLENGES : "lessonId"
  CHALLENGES ||--o{ CHALLENGEOPTIONS : "challengeId"
  CHALLENGES ||--o{ CHALLENGEPROGRESS : "challengeId"
  COURSES ||--o{ USERPROGRESS : "activeCourseId"

  USERS {
    text id PK
    text name
    text imageUrl
    timestamp createdAt
  }

  COURSES {
    int id PK
    text title
    text imageSrc
    timestamp createdAt
  }

  UNITS {
    int id PK
    int courseId FK
    text title
    int order
    timestamp createdAt
  }

  LESSONS {
    int id PK
    int unitId FK
    text title
    int order
    timestamp createdAt
  }

  CHALLENGES {
    int id PK
    int lessonId FK
    text type
    text question
    int order
    text audioSrc
    text imageSrc
  }

  CHALLENGEOPTIONS {
    int id PK
    int challengeId FK
    text text
    boolean isCorrect
    text audioSrc
    text imageSrc
  }

  CHALLENGEPROGRESS {
    int id PK
    text userId FK
    int challengeId FK
    boolean completed
    timestamp updatedAt
  }

  USERPROGRESS {
    text userId PK FK
    int activeCourseId FK
    int hearts
    int points
    timestamp updatedAt
  }

  USERSUBSCRIPTION {
    text userId PK FK
    text stripeCustomerId
    text stripeSubscriptionId
    timestamp stripeCurrentPeriodEnd
    boolean isPro
  }
```

## Tables

### users

-   Standard Laravel authentication table
-   `id`: Primary key
-   `name`: User's display name
-   `email`: User's email address
-   `password`: Hashed password
-   `image_url`: Profile picture URL
-   `email_verified_at`: Email verification timestamp
-   `created_at`/`updated_at`: Standard timestamps

### courses

-   `id`: Primary key
-   `title`: Course title (e.g., "Spanish", "French")
-   `image_src`: Course icon/flag image
-   `created_at`/`updated_at`: Standard timestamps

### units

-   `id`: Primary key
-   `course_id`: Foreign key to courses
-   `title`: Unit title (e.g., "Basics", "Food", "Travel")
-   `description`: Unit description
-   `order`: Sequence order within the course
-   `created_at`/`updated_at`: Standard timestamps

### lessons

-   `id`: Primary key
-   `unit_id`: Foreign key to units
-   `title`: Lesson title
-   `order`: Sequence order within the unit
-   `created_at`/`updated_at`: Standard timestamps

### challenges

-   `id`: Primary key
-   `lesson_id`: Foreign key to lessons
-   `type`: Challenge type (e.g., "SELECT", "ASSIST")
-   `question`: The question text
-   `order`: Sequence order within the lesson
-   `audio_src`: Optional audio URL for listening exercises
-   `image_src`: Optional image URL for visual exercises
-   `created_at`/`updated_at`: Standard timestamps

### challenge_options

-   `id`: Primary key
-   `challenge_id`: Foreign key to challenges
-   `text`: Option text
-   `is_correct`: Boolean indicating if this is the correct answer
-   `audio_src`: Optional audio URL for this option
-   `image_src`: Optional image URL for this option
-   `created_at`/`updated_at`: Standard timestamps

### challenge_progress

-   `id`: Primary key
-   `user_id`: Foreign key to users
-   `challenge_id`: Foreign key to challenges
-   `completed`: Boolean indicating if user completed this challenge
-   `created_at`/`updated_at`: Standard timestamps

### user_progress

-   `user_id`: Primary key and foreign key to users
-   `active_course_id`: Foreign key to courses, indicating current course
-   `hearts`: Number of hearts (lives) the user has
-   `points`: Total points earned
-   `created_at`/`updated_at`: Standard timestamps

### user_subscriptions

-   `user_id`: Primary key and foreign key to users
-   `stripe_customer_id`: Stripe customer ID
-   `stripe_subscription_id`: Stripe subscription ID
-   `stripe_current_period_end`: Subscription end date
-   `is_pro`: Boolean indicating if user has premium status
-   `created_at`/`updated_at`: Standard timestamps
