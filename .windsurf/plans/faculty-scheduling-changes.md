# Faculty Scheduling System - Teacher-First Registration Changes

## Overview

This document tracks the changes required to implement the teacher-first registration approach where teacher profiles can be created without user accounts, and user accounts can be linked later.

## Change Summary

**Previous Approach**: Teacher registration required selecting an existing user account (one-to-one relationship)

**New Approach**: Teacher profiles can be created independently with email, and user accounts can be linked later (one-to-optional relationship)

## Changes to Faculty Scheduling Plan

### 1. Functional Requirements Update

**Section**: Teacher Registration (Line 20-25)

**Before**:
- Faculty staff can register new teachers into the system
- Each teacher has personal information and employment details
- Teachers can be assigned roles (instructor, faculty staff, dean)

**After**:
- Faculty staff can register new teacher profiles without requiring user accounts
- Each teacher has personal information, employment details, and email address
- Teacher profiles can exist independently of user accounts
- User accounts can be created later and linked to existing teacher profiles
- Teachers can be assigned roles (instructor, faculty staff, dean) when user account is created

### 2. Data Entities Update

**Section**: Data Entities Identified (Line 74-75)

**Before**:
- Users: Extended Laravel users table with Spatie role-based access for teachers, faculty staff, and dean
- Teachers: Profile information for instructors (extends users)

**After**:
- Users: Extended Laravel users table with Spatie role-based access for teachers, faculty staff, and dean (created separately from teacher profiles)
- Teachers: Profile information for instructors with email, can exist without user account

### 3. Relationship Update

**Section**: Relationships (Line 185)

**Before**:
- Users → Teachers: One-to-One (users can be teachers)

**After**:
- Users → Teachers: One-to-Optional (teacher profiles can exist without users, users can be linked later)

### 4. Teachers Table Schema Update

**Section**: teachers Table (Line 580-737)

**Key Changes**:
- `user_id` changed from NOT NULL to nullable (optional)
- Added `email` field (varchar(255), NOT NULL, unique)
- Added `first_name` field (varchar(255), NOT NULL)
- Added `last_name` field (varchar(255), NOT NULL)
- Updated indexes to include unique email constraint
- Updated business rules to reflect teacher-first approach
- Updated access patterns to include email-based lookup

## Affected Code Files

### Backend Code Changes (Laravel Backend Code Review Workflow Applied)

#### Models
1. **app/Models/Teacher.php**
   - Update `$fillable` property to include `email`, `first_name`, `last_name`
   - Make `user_id` nullable in fillable array
   - Update relationship method to handle nullable user_id
   - Add validation rules for new fields
   - Add accessors/mutators for full name if needed

2. **app/Models/User.php**
   - Update relationship with Teacher to handle optional relationship
   - Add method to check if user has teacher profile
   - Add method to link user to existing teacher profile

#### Migrations
1. **database/migrations/create_teachers_table.php** (if exists) or new migration
   - Make `user_id` column nullable
   - Add `email` column with unique constraint
   - Add `first_name` column
   - Add `last_name` column
   - Update indexes

2. **database/migrations/update_teachers_table_for_user_account_linking.php** (new migration)
   - Handle existing data migration
   - Set unique constraints properly
   - Handle foreign key constraints

#### Controllers
1. **app/Http/Controllers/TeacherController.php**
   - Update `store()` method to validate new fields
   - Remove user account selection from registration form
   - Add email uniqueness validation
   - Update `update()` method to handle new fields
   - Add method to link user account to existing teacher

2. **app/Http/Controllers/UserController.php** (if exists)
   - Add method to create user account for existing teacher
   - Add method to link user to teacher profile

#### Requests/Validation
1. **app/Http/Requests/StoreTeacherRequest.php**
   - Add validation rules for `email`, `first_name`, `last_name`
   - Remove `user_id` requirement
   - Add email uniqueness rule

2. **app/Http/Requests/UpdateTeacherRequest.php**
   - Add validation rules for new fields
   - Handle optional user_id updates

#### Resources
1. **app/Http/Resources/TeacherResource.php**
   - Include new fields in JSON response
   - Handle null user relationship gracefully

#### Seeders
1. **database/seeders/TeacherSeeder.php** (if exists)
   - Update to include new required fields
   - Generate sample data with email, first_name, last_name

#### Factories
1. **database/factories/TeacherFactory.php**
   - Update definition to include new fields
   - Handle optional user_id
   - Generate realistic email addresses

### Frontend Code Changes (Creator Module UI Workflow Applied)

#### Pages/Components
1. **resources/js/pages/teachers/create.tsx**
   - Remove user account selection dropdown
   - Add email input field with validation
   - Add first_name and last_name input fields
   - Update form validation schema
   - Update API call to match new backend structure

2. **resources/js/pages/teachers/edit.tsx**
   - Add fields for email, first_name, last_name
   - Handle nullable user_id display
   - Add option to link/unlink user account
   - Update form validation

3. **resources/js/pages/teachers/index.tsx**
   - Update table columns to show email, full name
   - Add indicator for teachers without user accounts
   - Add action button to create user account for teacher

4. **resources/js/pages/teachers/show.tsx**
   - Display email, first_name, last_name
   - Show user account status (linked/unlinked)
   - Add button to create/link user account

#### Components
1. **resources/js/components/teachers/TeacherForm.tsx** (if exists)
   - Update form fields to match new structure
   - Remove user selection component
   - Add email validation
   - Add name fields

2. **resources/js/components/teachers/TeacherCard.tsx** (if exists)
   - Update to display email and full name
   - Show user account status

#### Services/API
1. **resources/js/services/teacherService.ts** (if exists)
   - Update API calls to include new fields
   - Add method to link user account
   - Update TypeScript interfaces

#### Types/Interfaces
1. **resources/js/types/teacher.ts**
   - Update Teacher interface to include new fields
   - Make user_id optional
   - Add email, first_name, last_name fields

#### Routes
1. **resources/js/routes/teacherRoutes.ts** (if exists)
   - Add route for linking user account to teacher
   - Update existing routes if needed

## Implementation Steps

### Phase 1: Database Schema Changes
1. Create migration to update teachers table
2. Run migration to update database
3. Update model relationships

### Phase 2: Backend Updates
1. Update Teacher model with new fields and relationships
2. Update validation requests
3. Update controllers for new registration flow
4. Add user account linking functionality
5. Update resources and factories

### Phase 3: Frontend Updates
1. Update teacher registration form
2. Update teacher list and detail views
3. Add user account linking interface
4. Update TypeScript types and services

### Phase 4: Testing and Data Migration
1. Test new registration flow
2. Test user account linking
3. Migrate existing data if needed
4. Update documentation

## Important Notes

- **No New Files**: This is a refactoring of existing code, not creating new functionality
- **Backward Compatibility**: Existing teachers with user accounts will continue to work
- **Data Integrity**: Email uniqueness must be enforced at database and application level
- **User Experience**: Clear indication of which teachers have user accounts vs. profile-only
- **Security**: When creating user accounts for existing teachers, proper authentication and authorization must be maintained

## Validation Requirements

### Teacher Registration
- Email must be unique across all teachers
- Email must be valid format
- First name and last name are required
- Employee ID must remain unique

### User Account Linking
- Only authorized users can link accounts
- Email matching between teacher and user account
- Prevent linking multiple teachers to same user account

### Data Consistency
- Ensure teacher profiles without user accounts can still be assigned to schedules
- Maintain role-based access control when user accounts are created
