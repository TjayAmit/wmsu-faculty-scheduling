---
description: Laravel Fullstack Security Review Workflow - Scan files/modules for vulnerabilities, list risks, provide solutions, and generate a remediation plan aligned with backend-code-style.md and frontend-code-style.md
---

# Laravel Fullstack Security Review Workflow

> **Persona**: You are a senior Laravel fullstack developer with 10 years of experience. You are deeply familiar with OWASP Top 10, Laravel security internals, Inertia.js SSR data exposure risks, and React XSS vectors. You know the difference between a theoretical vulnerability and one that actually matters in this codebase.

---

## How to Trigger This Workflow

Invoke this workflow by specifying a target:

```
security-review: scan [file|directory|module]
# Examples:
# security-review: scan app/Http/Controllers/TeacherController.php
# security-review: scan app/Http/Controllers/
# security-review: scan teachers module
# security-review: scan routes/web.php
# security-review: scan resources/js/pages/teachers/
```

When no target is given, perform a **full project scan** starting from the entry points:
- `routes/web.php`, `routes/api.php`
- `app/Http/Controllers/`
- `app/Models/`
- `app/Http/Requests/`
- `app/Services/`
- `resources/js/pages/`

---

## Phase 0: Context Setup

### Step 0.1 — Read Project Code Style References

Before scanning, load context from:
- `.windsurf/workflows/backend-code-style.md` — architectural rules, transaction boundaries, DTO patterns, soft delete requirements
- `.windsurf/workflows/frontend-code-style.md` — component structure, Inertia prop patterns, form handling

These define what **correct** looks like. Deviations from these patterns are a starting point for vulnerability discovery.

### Step 0.2 — Map the Target

Identify and list all files to be scanned. For a module target (e.g., "teachers"), auto-resolve:

```
app/Http/Controllers/[Module]Controller.php
app/Http/Requests/Store[Module]Request.php
app/Http/Requests/Update[Module]Request.php
app/Models/[Module].php
app/Services/[Module]Service.php          (if exists)
app/Repositories/[Module]Repository.php   (if exists)
app/DTOs/[Module]Data.php                 (if exists)
app/Http/Resources/[Module]Resource.php   (if exists)
routes/web.php                            (relevant route group)
resources/js/pages/[module]/index.tsx
resources/js/pages/[module]/create.tsx
resources/js/pages/[module]/edit.tsx
resources/js/pages/[module]/show.tsx
resources/js/components/[module]/         (if exists)
```

Print the resolved file list before proceeding.

---

## Phase 1: Backend Security Scan

Read each backend file. For every file, check each category below. Mark findings immediately — do not batch them.

### 1.1 Authentication & Route Protection

- [ ] All non-public routes are inside `auth` and `verified` middleware groups in `routes/web.php`
- [ ] No route accidentally exposes data without authentication (check `Route::get` outside middleware groups)
- [ ] API routes use Sanctum or equivalent token authentication if present
- [ ] Password reset / email verification flows are not bypassed

**Vulnerability pattern:**
```php
// ❌ RISK: Route outside auth middleware — unauthenticated access
Route::get('teachers/{teacher}', [TeacherController::class, 'show'])->name('teachers.show');

// ✅ CORRECT: Must be inside middleware group
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('teachers/{teacher}', [TeacherController::class, 'show'])->name('teachers.show');
});
```

---

### 1.2 Authorization (Policies & Gates)

- [ ] Every controller action that accesses a model checks authorization — `$this->authorize()` or Policy
- [ ] No controller directly acts on user-supplied IDs without ownership checks
- [ ] Soft-deleted records are not accessible via route model binding without explicit scope
- [ ] Admin-only actions are gate-protected, not just hidden from the UI

**Vulnerability pattern:**
```php
// ❌ RISK: No authorization — any authenticated user can edit any teacher
public function edit(Teacher $teacher)
{
    return Inertia::render('teachers/edit', ['teacher' => $teacher]);
}

// ✅ CORRECT: Check authorization
public function edit(Teacher $teacher)
{
    $this->authorize('update', $teacher);
    return Inertia::render('teachers/edit', ['teacher' => $teacher]);
}
```

---

### 1.3 Mass Assignment & Model Fillable

- [ ] All models define explicit `$fillable` — never use `$guarded = []`
- [ ] `$fillable` does not include sensitive system fields: `id`, `role`, `is_admin`, `email_verified_at`, `deleted_at`, `password` (unless intentional with hashing)
- [ ] DTOs explicitly map only allowed fields (per `backend-code-style.md` DTO pattern)
- [ ] `Model::create($request->all())` is never used — always `$request->validated()` or a DTO

**Vulnerability pattern:**
```php
// ❌ CRITICAL: Mass assignment with all input — attacker can set role/is_admin
Teacher::create($request->all());

// ❌ RISK: validated() still dangerous if 'role' passes validation
Teacher::create($request->validated());

// ✅ CORRECT: Use DTO (per backend-code-style.md)
$dto = TeacherData::fromRequest($request);
$this->repository->create($dto->toArray());
```

---

### 1.4 Input Validation (Form Requests)

- [ ] Every `store` and `update` method uses a dedicated Form Request class (`StoreXRequest`, `UpdateXRequest`)
- [ ] Form Requests are not replaced with inline `$request->validate()` for complex operations
- [ ] String fields have `max:` length limits to prevent buffer/DB overflow attacks
- [ ] `email` fields use `|email:rfc,dns|` for strict validation
- [ ] Integer/ID fields use `|integer|min:1|exists:table,id`
- [ ] File uploads (if any) validate: `mimes:`, `max:` size, no executable extensions
- [ ] `unique` rules on update correctly exclude the current record's ID

**Vulnerability pattern:**
```php
// ❌ RISK: Missing max length — potential DB overflow or payload attack
'name' => 'required|string',

// ❌ RISK: update unique rule missing exclusion — rejects own email
'email' => 'required|email|unique:teachers,email',

// ✅ CORRECT
'name'  => ['required', 'string', 'max:255'],
'email' => ['required', 'email:rfc,dns', 'max:255', Rule::unique('teachers', 'email')->ignore($this->teacher)],
```

---

### 1.5 SQL Injection

- [ ] No raw `DB::statement()` or `DB::select()` with string concatenation of user input
- [ ] `whereRaw()`, `orderByRaw()`, `selectRaw()` — check bindings are used for user values
- [ ] LIKE search queries use `?` or named bindings, not string interpolation

**Vulnerability pattern:**
```php
// ❌ CRITICAL: SQL injection via search
$query->whereRaw("name LIKE '%" . $request->search . "%'");

// ✅ CORRECT: Use parameterized binding
$query->where('name', 'like', '%' . $request->search . '%');
// OR with whereRaw
$query->whereRaw('name LIKE ?', ['%' . $request->search . '%']);
```

---

### 1.6 Transaction & Data Integrity (per backend-code-style.md)

- [ ] All write operations (`store`, `update`, `destroy`) use `DB::transaction()`
- [ ] No partial writes possible — transaction rolls back on exception
- [ ] Activity logging happens **after** commit or is configured with `after_commit`
- [ ] Deleted records use soft delete (`SoftDeletes` trait + `softDeletes()` migration column)

**Risk**: Missing transactions can leave the database in an inconsistent state, which can be exploited in race conditions or by causing targeted failures.

---

### 1.7 Sensitive Data Exposure in Responses

- [ ] API/Inertia responses use Resource classes — never return raw `$model->toArray()` or `$model`
- [ ] Resources exclude: `password`, `remember_token`, `two_factor_secret`, internal system fields
- [ ] Pagination does not leak full model data in `meta` or `links` fields
- [ ] Error messages in catch blocks do not expose stack traces, SQL, or file paths to the client

**Vulnerability pattern:**
```php
// ❌ CRITICAL: Returns password hash, remember_token to frontend
return Inertia::render('teachers/show', ['teacher' => $teacher]);

// ✅ CORRECT: Use API Resource to whitelist fields
return Inertia::render('teachers/show', ['teacher' => new TeacherResource($teacher)]);
```

---

### 1.8 File Upload Security (if applicable)

- [ ] Files stored outside `public/` — use `storage/app/private/` with signed URLs
- [ ] Filename sanitized — never use `$request->file->getClientOriginalName()` directly as stored name
- [ ] MIME type validated server-side with `finfo`, not just by extension
- [ ] Image files processed through an image library (Intervention) to strip malicious payloads
- [ ] Upload size limited at both Laravel and web server (nginx/Apache) level

---

### 1.9 Rate Limiting & Brute Force

- [ ] Login routes use `throttle:login` or custom rate limiter
- [ ] Password reset and email verification endpoints are rate-limited
- [ ] Any search or filter endpoint that queries the DB has rate limiting applied
- [ ] API routes apply `throttle:api` middleware

---

### 1.10 CSRF Protection

- [ ] All state-changing routes (POST, PUT, PATCH, DELETE) are inside web middleware (CSRF auto-applied)
- [ ] No `VerifyCsrfToken` exclusions for sensitive routes
- [ ] Inertia's `X-XSRF-TOKEN` header is being sent by the frontend (Inertia handles this automatically — verify it is not disabled)

---

### 1.11 Environment & Configuration Leakage

- [ ] `APP_DEBUG=false` in production (check `.env.example` does not default to `true`)
- [ ] `APP_KEY` is not hardcoded anywhere in code
- [ ] No secrets in `config/` files that come from hardcoded strings — all via `env()`
- [ ] `.env` is in `.gitignore`
- [ ] No credentials in migration files, seeders, or test fixtures committed to git

---

### 1.12 Logging Security

- [ ] Spatie activity log (per `backend-code-style.md`) does not log raw passwords or tokens
- [ ] `Log::error()` calls redact sensitive fields before logging
- [ ] Log files are not publicly accessible (`storage/logs/` is not in `public/`)

---

## Phase 2: Frontend Security Scan (React + Inertia SSR)

Read each frontend file. Check every category below.

### 2.1 Inertia Prop Data Exposure

- [ ] `Inertia::render()` calls do not pass full model objects with sensitive fields (see Phase 1.7)
- [ ] Shared data in `HandleInertiaRequests::share()` does not include sensitive user fields
- [ ] `$page.props` accessible in all components — verify nothing secret is shared globally

**Vulnerability pattern:**
```php
// ❌ RISK in HandleInertiaRequests.php: leaks sensitive auth user data to ALL pages
'auth' => [
    'user' => $request->user(),  // includes password_hash, remember_token
],

// ✅ CORRECT: Whitelist fields
'auth' => [
    'user' => $request->user()?->only(['id', 'name', 'email']),
],
```

---

### 2.2 XSS — dangerouslySetInnerHTML

- [ ] `dangerouslySetInnerHTML` is **never** used with user-supplied content
- [ ] If `dangerouslySetInnerHTML` must be used, content is sanitized with DOMPurify before rendering
- [ ] No `eval()`, `Function()`, or dynamic `<script>` injection from server data

---

### 2.3 Form Submission Security

- [ ] Forms use Inertia's `useForm` — not raw `fetch()` or `axios.post()` without CSRF
- [ ] Inertia forms include the CSRF token (automatic via `useForm`)
- [ ] File upload forms use `forceFormData: true` in Inertia options
- [ ] Password fields: `autocomplete="current-password"` or `"new-password"` is set correctly
- [ ] Password values are cleared from state after submission (`reset('password')` in `onSuccess`)

**Vulnerability pattern:**
```tsx
// ❌ RISK: Password stays in component state after successful form submit
const { data, post } = useForm({ email: '', password: '' });
post(route('login'));  // password lingers in state

// ✅ CORRECT: Reset sensitive fields
post(route('login'), {
    onSuccess: () => reset('password'),
});
```

---

### 2.4 Sensitive Data in Component State / LocalStorage

- [ ] No tokens, passwords, or PII stored in `localStorage` or `sessionStorage`
- [ ] React state does not persist sensitive data beyond the form's lifecycle
- [ ] No sensitive values in URL query parameters (visible in browser history + server logs)

---

### 2.5 Open Redirect

- [ ] After login/logout redirects, the `redirect` query param is validated against an allowlist of internal paths
- [ ] `router.visit()` and `router.get()` calls with user-supplied URLs are sanitized

**Vulnerability pattern:**
```php
// ❌ RISK: Open redirect — attacker sends ?redirect=https://evil.com
return redirect($request->query('redirect', '/dashboard'));

// ✅ CORRECT: Validate destination is internal
$redirect = $request->query('redirect', '/dashboard');
if (!Str::startsWith($redirect, '/')) {
    $redirect = '/dashboard';
}
return redirect($redirect);
```

---

### 2.6 Content Security Policy (CSP) Headers

- [ ] CSP headers are configured (check `app/Http/Middleware/` or `config/headers.php`)
- [ ] `script-src` does not allow `'unsafe-inline'` or `'unsafe-eval'`
- [ ] Inertia SSR does not inject unescaped server data into script tags

---

### 2.7 Dependency Vulnerabilities

- [ ] Run `npm audit` — flag any high/critical severity packages
- [ ] Run `composer audit` — flag any PHP packages with known CVEs
- [ ] Note outdated packages that have security patches available

---

## Phase 3: Compile Vulnerability Report

After scanning all files, produce a structured report in this format:

---

### SECURITY SCAN REPORT

**Target**: `[file/module scanned]`
**Date**: `[current date]`
**Scanned Files**: `[list]`

---

#### CRITICAL Vulnerabilities
> Must fix before next deployment. Exploitable without special conditions.

| # | File | Line | Vulnerability | OWASP Category |
|---|------|------|---------------|----------------|
| C1 | `app/Http/Controllers/X.php` | 42 | Mass assignment via `$request->all()` | A03: Injection |
| C2 | ... | ... | ... | ... |

**Details & Solution for each CRITICAL finding:**

```
C1 — Mass Assignment
File: app/Http/Controllers/TeacherController.php:42
Code: Teacher::create($request->all());
Risk: Attacker can inject 'role' or 'is_admin' fields via HTTP request body.
Fix:  Use TeacherData DTO per backend-code-style.md:
      $dto = TeacherData::fromRequest($request);
      $this->repository->create($dto->toArray());
Basis: backend-code-style.md §3 "DTO Structure", OWASP A03
```

---

#### HIGH Vulnerabilities
> Fix in the current sprint. Exploitable with moderate effort or specific conditions.

| # | File | Line | Vulnerability | OWASP Category |
|---|------|------|---------------|----------------|
| H1 | ... | ... | ... | ... |

**Details & Solution for each HIGH finding** (same format as CRITICAL).

---

#### MEDIUM Vulnerabilities
> Fix in the next sprint. Defense-in-depth issues or partial mitigations in place.

| # | File | Line | Vulnerability | OWASP Category |
|---|------|------|---------------|----------------|
| M1 | ... | ... | ... | ... |

---

#### LOW / Informational
> Best-practice gaps. No immediate exploitability.

| # | File | Line | Issue | Recommendation |
|---|------|------|-------|----------------|
| L1 | ... | ... | ... | ... |

---

#### PASSED Checks
> List checks that passed cleanly — confirms what is working correctly.

- [x] All routes inside auth middleware
- [x] Soft deletes present on all models
- [x] ...

---

## Phase 4: Remediation Plan

Generate an ordered, step-by-step list to fix all findings. Order: CRITICAL → HIGH → MEDIUM → LOW.

Each step must specify:
- **What** to change
- **Which file and line**
- **The exact fix** (code snippet when applicable)
- **Reference** to `backend-code-style.md` or `frontend-code-style.md` section

---

### REMEDIATION STEPS

#### Step 1 — [SHORT TITLE] (CRITICAL)
**File**: `app/Http/Controllers/TeacherController.php`
**Line**: 42
**Action**: Replace `Teacher::create($request->all())` with DTO pattern.

```php
// Before
Teacher::create($request->all());

// After (per backend-code-style.md §3 DTO Structure)
$dto = TeacherData::fromRequest($request);
$this->teacherRepository->create($dto->toArray());
```

**Verification**: After fix, attempt to POST `{"role":"admin"}` in request body — verify it has no effect.

---

#### Step 2 — [SHORT TITLE] (HIGH)
...

---

#### Step N — Run Security Audit Tools

```bash
# PHP dependency audit
./vendor/bin/sail composer audit

# JS dependency audit
./vendor/bin/sail npm audit

# Run Laravel Pint for code style compliance
./vendor/bin/sail pint --test

# Run automated tests to verify fixes did not break functionality
./vendor/bin/sail artisan test
```

---

## Phase 5: Post-Remediation Verification Checklist

After all fixes are applied, confirm each item:

### Backend
- [ ] No route accessible without auth middleware
- [ ] All write controllers use Form Request classes
- [ ] All write services use `DB::transaction()`
- [ ] All models define explicit `$fillable` without sensitive fields
- [ ] All Inertia responses use Resource classes — no raw model returns
- [ ] No `$request->all()` in `create()` or `update()` calls
- [ ] Soft deletes present on all models and migrations
- [ ] Activity logging does not log sensitive data
- [ ] `composer audit` returns zero high/critical issues

### Frontend
- [ ] No `dangerouslySetInnerHTML` with user data
- [ ] No sensitive data in `localStorage`/`sessionStorage`
- [ ] Password fields reset after successful form submission
- [ ] No open redirect vulnerabilities in redirect params
- [ ] `npm audit` returns zero high/critical issues
- [ ] Inertia shared props do not expose sensitive user fields

---

## Security Severity Reference

| Severity | Definition | Example |
|----------|-----------|---------|
| CRITICAL | Direct exploit, no auth needed or auth bypass | SQL injection, unauthenticated route, mass assignment to `role` |
| HIGH | Auth required or partial conditions needed | Missing authorization policy, sensitive data in API response |
| MEDIUM | Defense-in-depth gap, partial protection exists | Missing rate limiting, weak validation rule |
| LOW | Best practice deviation, no immediate risk | Missing `autocomplete` attribute, log verbosity |

---

## OWASP Top 10 Coverage Mapping

| OWASP ID | Category | Checks Covered |
|----------|----------|----------------|
| A01 | Broken Access Control | 1.1, 1.2 |
| A02 | Cryptographic Failures | 1.7, 2.4 |
| A03 | Injection | 1.3, 1.5 |
| A04 | Insecure Design | 1.6, 2.1 |
| A05 | Security Misconfiguration | 1.11, 2.6 |
| A06 | Vulnerable Components | 2.7 |
| A07 | Identification & Authentication Failures | 1.1, 1.9 |
| A08 | Software & Data Integrity Failures | 1.6, 1.10 |
| A09 | Security Logging & Monitoring Failures | 1.12 |
| A10 | Server-Side Request Forgery | 2.5 |
