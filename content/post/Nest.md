+++
title = 'Nest'
date = 2026-03-29T23:01:37+07:00
description = "Nestjs Backend Interview"
image = "/images/nest-og.png"
categories = ["interview"]
authors = ["tung09hcm"]
avatar = ["/images/hecker.jpg"]
+++

## MỤC LỤC

1. [NestFactory là gì?](#1-nestfactory-là-gì)
2. [@Res — khi nào nên và không nên dùng](#2-res--khi-nào-nên-và-không-nên-dùng)
3. [Response status code mặc định (200, 201)](#3-response-status-code-mặc-định-200-201)
4. [@HttpCode là gì?](#4-httpcode-là-gì)
5. [Observable stream là gì — tại sao async/await trả về được?](#5-observable-stream-là-gì--tại-sao-asyncawait-trả-về-được)
6. [Providers là gì?](#6-providers-là-gì)
7. [@Injectable và @Inject là gì?](#7-injectable-và-inject-là-gì)
8. [Dependency Injection trong NestJS](#8-dependency-injection-trong-nestjs)
9. [Dynamic Modules là gì?](#9-dynamic-modules-là-gì)
10. [Middleware là gì?](#10-middleware-là-gì)
11. [MiddlewareConsumer là gì?](#11-middlewareconsumer-là-gì)
12. [Exception Filter là gì?](#12-exception-filter-là-gì)
13. [Binding Filter là gì? @Catch và @UseFilters](#13-binding-filter-là-gì-catch-và-usefilters)
14. [Pipes là gì — dùng cho gì?](#14-pipes-là-gì--dùng-cho-gì)
15. [Tại sao dùng Guards mà không dùng Middleware?](#15-tại-sao-dùng-guards-mà-không-dùng-middleware)
16. [@UseGuards(new RolesGuard()) khác gì @UseGuards(RolesGuard)?](#16-useguardsnew-rolesguard-khác-gì-useguardsrolesguard)
17. [@Roles là gì? Các level của Guard](#17-roles-là-gì-các-level-của-guard)
18. [AOP là gì? Interceptor làm gì?](#18-aop-là-gì-interceptor-làm-gì)
19. [Injection Scope](#19-injection-scope)
20. [4 tính chất của OOP](#20-4-tính-chất-của-oop)
21. [SOLID là gì?](#21-solid-là-gì)
22. [TypeORM và Prisma — khác gì nhau?](#22-typeorm-và-prisma--khác-gì-nhau)
23. [PostgreSQL và MySQL — khác gì nhau, khi nào dùng cái nào?](#23-postgresql-và-mysql--khác-gì-nhau-khi-nào-dùng-cái-nào)
24. [Callback, Promise, Async/Await — phân biệt và xử lý lỗi](#24-callback-promise-asyncawait--phân-biệt-và-xử-lý-lỗi)
25. [Event Loop, Single Thread, Non-blocking I/O, Callback Queue](#25-event-loop-single-thread-non-blocking-io-callback-queue)
26. [ACID là gì?](#26-acid-là-gì)
27. [Thiết kế hệ thống với WebSocket, RabbitMQ, Redis, Microservice](#27-thiết-kế-hệ-thống-với-websocket-rabbitmq-redis-microservice)
28. [N+1 Problem là gì và cách giải quyết](#28-n1-problem-là-gì-và-cách-giải-quyết)
29. [Chuyện gì xảy ra khi nhập URL lên browser?](#29-chuyện-gì-xảy-ra-khi-nhập-url-lên-browser)
30. [Kiến trúc Docker — Container, Image, Docker Compose](#30-kiến-trúc-docker--container-image-docker-compose)
31. [Cách giải quyết khi database query chậm](#31-cách-giải-quyết-khi-database-query-chậm)
32. [CQRS Pattern trong NestJS](#32-cqrs-pattern-trong-nestjs)

---

## 1. NestFactory là gì?

`NestFactory` là class trung tâm để khởi tạo toàn bộ ứng dụng NestJS. Khi bạn gọi `NestFactory.create(AppModule)`, NestJS sẽ thực hiện một chuỗi công việc rất phức tạp bên dưới: nó khởi tạo IoC container (Inversion of Control container), quét toàn bộ metadata được gắn trên các class thông qua decorators (nhờ thư viện `reflect-metadata`), xây dựng dependency graph cho tất cả providers, giải quyết circular dependency nếu có, và cuối cùng tạo ra một instance của HTTP server (Express hoặc Fastify tùy config).

Điều quan trọng cần hiểu là `NestFactory.create()` trả về một `INestApplication` — đây là một wrapper bao quanh HTTP server thật sự, không phải HTTP server trực tiếp. Thông qua `app` object này, bạn có thể gắn global middleware, global pipes, global guards, global interceptors, global exception filters, và cấu hình CORS trước khi server bắt đầu lắng nghe request.

```typescript
async function bootstrap() {
  // Tạo ứng dụng với platform Express (mặc định)
  const app = await NestFactory.create(AppModule);

  // Hoặc dùng Fastify để có performance cao hơn
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Cấu hình global trước khi listen
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({ origin: process.env.ALLOWED_ORIGINS?.split(",") });

  await app.listen(3000);
  console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
```

Ngoài `create()`, `NestFactory` còn có `createMicroservice()` để tạo microservice và `createApplicationContext()` để tạo một standalone application context (không có HTTP server) — thường dùng cho script một lần như seeding database hay chạy migration.

---

## 2. @Res — khi nào nên và không nên dùng

`@Res()` là decorator cho phép bạn inject trực tiếp response object của Express/Fastify vào trong controller method. Đây là một escape hatch — nó phá vỡ lớp abstraction mà NestJS tạo ra và bạn cần hiểu rõ hậu quả trước khi dùng.

**Khi KHÔNG nên dùng (đại đa số trường hợp):** NestJS tự động xử lý serialization (chuyển object sang JSON), đặt Content-Type header, gửi status code phù hợp, và kết thúc response. Khi bạn return một object từ controller method, NestJS làm tất cả điều đó cho bạn. Interceptor, response transformation, và caching đều hoạt động dựa trên cơ chế này. Nếu bạn inject `@Res()`, bạn phải tự làm mọi thứ — và quan trọng hơn, nếu bạn quên gọi `res.send()` hoặc `res.end()`, request sẽ bị treo mãi mãi (hang forever).

**Khi NÊN dùng:** Có ba trường hợp thực sự cần `@Res()`. Một là khi cần set cookie vì NestJS không có decorator native cho việc này (`res.cookie('token', value, options)`). Hai là khi stream file về client vì cần pipe stream vào response object trực tiếp. Ba là khi cần redirect với logic phức tạp hơn decorator `@Redirect()` cho phép.

```typescript
// ❌ KHÔNG NÊN — mất interceptor, mất NestJS response handling
@Get('users')
getUsers(@Res() res: Response) {
  const users = this.userService.findAll();
  res.status(200).json(users); // thủ công, interceptor không chạy
}

// ✅ NÊN — để NestJS xử lý
@Get('users')
getUsers() {
  return this.userService.findAll(); // interceptor vẫn chạy, serialize tự động
}

// ✅ Trường hợp PHẢI dùng @Res — stream file
@Get('download/:filename')
downloadFile(@Param('filename') filename: string, @Res() res: Response) {
  const filePath = path.join(process.cwd(), 'uploads', filename);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  createReadStream(filePath).pipe(res);
}

// ✅ Trường hợp PHẢI dùng @Res — set cookie
@Post('login')
async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
  const token = await this.authService.login(dto);
  res.cookie('access_token', token, { httpOnly: true, secure: true });
  return { message: 'Logged in successfully' }; // vẫn return để interceptor chạy
}
```

Lưu ý quan trọng: `@Res({ passthrough: true })` là cách dùng hybrid — bạn có thể vừa set cookie/header vừa vẫn return value để NestJS xử lý phần còn lại. Đây là pattern được khuyến nghị khi chỉ cần thao tác một phần trên response.

---

## 3. Response status code mặc định (200, 201)

NestJS quy ước rằng mọi GET, PUT, PATCH, DELETE method đều trả về `200 OK` theo mặc định. Riêng POST trả về `201 Created` vì convention RESTful cho rằng POST thường tạo ra resource mới. Đây là behavior được hard-code trong framework dựa trên HTTP method của route.

Cơ chế này đến từ cách NestJS đọc HTTP method của decorator và quyết định status code. Khi bạn dùng `@Post()`, framework biết đây là một create operation và set status 201. Khi dùng `@Get()`, `@Put()`, `@Patch()`, `@Delete()` thì status là 200. Điều này aligned với HTTP spec và RESTful convention nhưng không phải lúc nào cũng đúng với business logic thực tế — đó là lý do `@HttpCode` tồn tại.

---

## 4. @HttpCode là gì?

`@HttpCode()` là decorator cho phép bạn override status code mặc định của một route handler. Bạn gắn nó lên method trong controller và truyền vào số status code mong muốn. NestJS cung cấp enum `HttpStatus` để tránh magic number.

```typescript
import { HttpCode, HttpStatus } from '@nestjs/common';

// Override POST từ 201 xuống 200 — dùng khi POST không tạo resource
// mà chỉ thực hiện một action (ví dụ: POST /auth/logout)
@Post('logout')
@HttpCode(HttpStatus.OK) // 200 thay vì 201
async logout(@CurrentUser() user: UserEntity) {
  await this.authService.invalidateToken(user.id);
  return { message: 'Logged out' };
}

// DELETE thường trả về 204 No Content (không có body)
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT) // 204
async remove(@Param('id') id: string) {
  await this.userService.remove(id);
  // không return gì — body rỗng, phù hợp với 204
}

// Accepted — dùng khi action được nhận nhưng chưa hoàn thành (async job)
@Post('export')
@HttpCode(HttpStatus.ACCEPTED) // 202
async requestExport(@Body() dto: ExportDto) {
  const jobId = await this.exportService.enqueue(dto);
  return { jobId }; // client sẽ poll để check trạng thái
}
```

Điểm cần nhớ: `@HttpCode` chỉ set status code cho happy path. Khi throw exception, status code được xác định bởi exception type (ví dụ `NotFoundException` → 404, `BadRequestException` → 400), không bị ảnh hưởng bởi `@HttpCode`.

---

## 5. Observable stream là gì — tại sao async/await trả về được?

Observable là một concept từ thư viện RxJS (Reactive Extensions for JavaScript). Về bản chất, Observable là một lazy data producer — nó không làm gì cả cho đến khi có subscriber. Khi có subscriber, nó có thể emit ra không hoặc nhiều giá trị theo thời gian, rồi complete hoặc error. Đây khác với Promise — Promise chỉ resolve một lần, còn Observable có thể emit nhiều lần (ví dụ: stream dữ liệu thời gian thực).

NestJS request handlers có thể trả về ba kiểu giá trị: giá trị thường (sync), Promise, hoặc Observable. Framework xử lý cả ba. Khi bạn return một Observable, NestJS tự động subscribe vào nó, lấy giá trị đầu tiên được emit, unsubscribe, và gửi giá trị đó về client. Đây là lý do bạn có thể dùng `async/await` (trả về Promise) hoặc return Observable mà không cần lo — NestJS sẽ "unwrap" cả hai.

```typescript
// Cả 3 cách đều hoạt động, NestJS xử lý đồng nhất

// 1. Sync — return trực tiếp
@Get('sync')
getSync(): string {
  return 'Hello'; // NestJS gửi ngay
}

// 2. Async/Promise
@Get('async')
async getAsync(): Promise<UserDto> {
  return this.userService.findOne(id); // NestJS await Promise rồi gửi
}

// 3. Observable — thường thấy khi dùng NestJS Microservice hoặc RxJS operators
@Get('observable')
getObservable(): Observable<UserDto> {
  return from(this.userService.findOne(id)).pipe(
    map(user => plainToInstance(UserDto, user)),
    timeout(5000), // tự động timeout sau 5 giây
    catchError(err => throwError(() => new InternalServerErrorException()))
  );
  // NestJS subscribe, lấy giá trị đầu tiên, unsubscribe
}
```

Observable mạnh hơn Promise ở chỗ: hỗ trợ cancellation (unsubscribe = cancel), có hệ sinh thái operator phong phú (debounce, retry, combineLatest, mergeMap), và rất phù hợp cho streaming data. Trong context NestJS HTTP (một request = một response), Observable không phát huy hết sức mạnh. Nhưng trong NestJS Microservice với transport như RabbitMQ hay Kafka, Observable rất có ý nghĩa vì một request có thể nhận nhiều response theo thời gian.

---

## 6. Providers là gì?

Provider là khái niệm trung tâm trong NestJS — bất kỳ thứ gì có thể được inject vào chỗ khác thông qua DI system đều là provider. Service, Repository, Factory, Helper, Config, Connection — tất cả đều là provider. Khi bạn khai báo một class trong mảng `providers` của `@Module()`, bạn đang nói với IoC container: "Hãy quản lý lifecycle của class này và cho phép inject nó vào nơi khác."

Provider không chỉ là class. NestJS hỗ trợ nhiều dạng provider khác nhau cho các use case khác nhau:

```typescript
@Module({
  providers: [
    // 1. Class provider (cách viết tắt, phổ biến nhất)
    UserService,
    // Tương đương với:
    { provide: UserService, useClass: UserService },

    // 2. Value provider — inject một giá trị cố định, không phải instance
    { provide: "JWT_SECRET", useValue: process.env.JWT_SECRET },
    { provide: "APP_CONFIG", useValue: { maxUploadSize: 10 * 1024 * 1024 } },

    // 3. Factory provider — tạo provider từ một factory function
    // Factory có thể async, có thể nhận dependency khác
    {
      provide: "DATABASE_CONNECTION",
      useFactory: async (configService: ConfigService) => {
        return createConnection({
          type: "postgres",
          host: configService.get("DB_HOST"),
          port: configService.get<number>("DB_PORT"),
        });
      },
      inject: [ConfigService], // inject dependency vào factory
    },

    // 4. Alias provider — tạo alias cho provider đã có
    { provide: "IUserService", useExisting: UserService },
    // Bây giờ inject 'IUserService' và UserService đều trả về cùng instance
  ],
})
export class UserModule {}

// Inject value/string token
@Injectable()
export class AuthService {
  constructor(
    @Inject("JWT_SECRET") private readonly jwtSecret: string,
    @Inject("APP_CONFIG") private readonly config: AppConfig,
  ) {}
}
```

Điểm quan trọng: provider có scope (singleton, request-scoped, transient) ảnh hưởng đến lifecycle của chúng. Mặc định là singleton — một instance được tạo một lần và tái sử dụng cho toàn bộ application.

---

## 7. @Injectable và @Inject là gì?

Hai decorator này thường bị nhầm lẫn nhưng có mục đích hoàn toàn khác nhau.

`@Injectable()` là decorator bạn đặt lên một class để đánh dấu rằng class này có thể tham gia vào DI system — tức là nó có thể được inject vào class khác, và NestJS sẽ tự động phân tích constructor của nó để resolve các dependency. Kỹ thuật hoạt động: `@Injectable()` gắn metadata vào class thông qua `Reflect.defineMetadata`, và khi IoC container khởi tạo class này, nó đọc metadata đó để biết cần inject gì vào constructor. Nếu bạn quên `@Injectable()`, TypeScript sẽ không emit type metadata cho constructor parameters, và NestJS sẽ không biết cần inject gì → runtime error.

`@Inject()` là decorator bạn đặt lên một constructor parameter để chỉ định _token_ cần inject. Token này có thể là một class (TypeScript type), một string, hoặc một Symbol. `@Inject()` cần thiết trong hai trường hợp: khi inject provider có token là string/Symbol (vì TypeScript không có type information cho string token), và khi muốn inject interface (vì interface bị erase sau compile, TypeScript không giữ lại type info của interface ở runtime).

```typescript
// @Injectable() — đánh dấu class có thể được inject
@Injectable()
export class UserService {
  // constructor parameters được resolve tự động nhờ TypeScript type metadata
  constructor(
    private readonly userRepo: UserRepository, // inject bằng class type
    private readonly emailSvc: EmailService, // inject bằng class type

    // @Inject() cần thiết khi token là string
    @Inject("JWT_SECRET") private readonly secret: string,

    // @Inject() cần thiết khi inject interface (abstract class thường dùng thay)
    @Inject("INotificationService")
    private readonly notifier: INotificationService,
  ) {}
}

// Trường hợp hay gặp: @Inject() với token từ TypeORM
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) // @InjectRepository = @Inject(getRepositoryToken(User))
    private readonly repo: Repository<User>,
  ) {}
}
```

Một lưu ý về `@Injectable()` với circular dependency: NestJS resolve dependency theo thứ tự. Nếu A depend on B và B depend on A, bạn cần dùng `forwardRef(() => B)` để phá vỡ vòng tròn.

---

## 8. Dependency Injection trong NestJS

DI (Dependency Injection) là một design pattern trong đó một class không tự tạo ra các dependency của mình, thay vào đó nhận chúng từ bên ngoài. NestJS implement DI thông qua IoC (Inversion of Control) container — một registry quản lý toàn bộ lifecycle và dependency graph của tất cả providers.

Luồng hoạt động như sau: khi ứng dụng khởi động, NestJS quét tất cả module và xây dựng một dependency graph. Với mỗi class được đánh dấu `@Injectable()`, container đọc constructor parameter types (thông tin này được TypeScript compiler emit ra nhờ decorator `reflect-metadata`), tìm provider tương ứng trong registry, instantiate theo đúng thứ tự dependency (leaf nodes trước), và inject vào constructor. Toàn bộ quá trình này xảy ra một lần khi app khởi động (với default singleton scope).

```typescript
// Ví dụ đầy đủ về DI flow

// 1. Define dependency (leaf node — không depend on gì thêm)
@Injectable()
export class MailService {
  async sendEmail(to: string, subject: string, body: string) {
    // gửi email thật
  }
}

// 2. Depend on MailService
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private mailService: MailService, // DI inject MailService vào đây
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.userRepo.save(dto);
    await this.mailService.sendEmail(user.email, "Welcome!", "...");
    return user;
  }
}

// 3. Controller depend on UserService
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {} // DI inject UserService
}

// 4. Module khai báo để container biết
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, MailService],
  controllers: [UserController],
})
export class UserModule {}
```

Lợi ích cốt lõi của DI trong thực tế: khi viết unit test, bạn có thể inject mock thay cho implementation thật, không cần database thật hay SMTP server. Khi cần swap implementation (đổi từ Gmail sang Sendgrid), chỉ cần thay provider registration trong module, không đụng đến business logic.

---

## 9. Dynamic Modules là gì?

Module thông thường (static module) được cấu hình tại thời điểm compile — tất cả providers được hard-code. Dynamic module là module có thể nhận cấu hình từ bên ngoài tại runtime, thường thông qua static method `forRoot()`, `forRootAsync()`, `forFeature()`, hoặc `register()`. Pattern này giải quyết vấn đề: làm thế nào để tạo module có thể tái sử dụng với nhiều cấu hình khác nhau.

Ví dụ điển hình nhất là `TypeOrmModule.forRoot()` — bạn truyền database connection options vào và module sẽ tạo connection phù hợp. Không có dynamic module, bạn sẽ phải viết một `DatabaseModule` riêng cho mỗi project với config hard-code bên trong.

```typescript
// Viết một dynamic module từ đầu — ví dụ: CacheModule
@Module({})
export class CacheModule {
  // forRoot — cấu hình toàn cục một lần ở AppModule
  static forRoot(options: CacheOptions): DynamicModule {
    return {
      module: CacheModule,
      global: true, // available khắp app mà không cần import lại
      providers: [
        {
          provide: "CACHE_OPTIONS",
          useValue: options,
        },
        CacheService,
      ],
      exports: [CacheService],
    };
  }

  // forRootAsync — khi options cần load async (ví dụ từ ConfigService)
  static forRootAsync(options: CacheAsyncOptions): DynamicModule {
    return {
      module: CacheModule,
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: "CACHE_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        CacheService,
      ],
      exports: [CacheService],
    };
  }
}

// Sử dụng trong AppModule
@Module({
  imports: [
    CacheModule.forRoot({ ttl: 300, store: "redis" }),
    // Hoặc async:
    CacheModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>("CACHE_TTL"),
        store: config.get("CACHE_STORE"),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

Dynamic module là pattern bạn sẽ thấy ở khắp nơi trong NestJS ecosystem: `ConfigModule.forRoot()`, `TypeOrmModule.forRoot()`, `JwtModule.register()`, `ClientsModule.register()`. Hiểu dynamic module giúp bạn tự viết được reusable library-style modules cho team.

---

## 10. Middleware là gì?

Middleware trong NestJS là function chạy trước khi request đến route handler. Về bản chất, NestJS middleware là Express/Connect middleware — một function nhận `(req, res, next)` và quyết định có tiếp tục request bằng cách gọi `next()` hay không. Middleware chạy ở tầng thấp nhất trong request pipeline, trước cả Guards, Pipes, và Interceptors.

Middleware phù hợp cho các việc: logging request, parse body, validate session cookie, rate limiting, CORS, compression, và bất kỳ thao tác nào cần chạy trên HTTP request/response object trực tiếp nhưng không cần biết đến NestJS context (không cần biết đang ở route nào, controller nào, method nào).

```typescript
// Cách 1: Functional middleware — đơn giản, không cần inject dependency
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
}

// Cách 2: Class middleware — có thể inject dependency qua DI
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        req["user"] = this.jwtService.verify(token);
      } catch {
        // token invalid — không throw, chỉ để req.user undefined
        // Guard sẽ quyết định có cho qua không
      }
    }
    next(); // luôn gọi next() trong middleware, trừ khi muốn chặn request
  }
}
```

Điểm khác biệt quan trọng giữa middleware và guard: middleware không biết về execution context của NestJS (không biết handler nào sắp được gọi, không đọc được metadata từ decorators). Guard thì có. Đây là lý do authentication logic thường ở Guard, còn middleware chỉ làm công việc "thấp" hơn như parse token mà thôi.

---

## 11. MiddlewareConsumer là gì?

`MiddlewareConsumer` là interface cung cấp API fluent để cấu hình middleware — chỉ định middleware nào áp dụng cho route nào và trừ route nào. Bạn dùng nó trong method `configure()` của module.

```typescript
@Module({
  controllers: [UserController, AuthController, ProductController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(requestLogger) // functional middleware
      .forRoutes("*"); // tất cả routes

    consumer
      .apply(AuthMiddleware) // class middleware
      .exclude(
        { path: "auth/login", method: RequestMethod.POST },
        { path: "auth/register", method: RequestMethod.POST },
        { path: "health", method: RequestMethod.GET },
      )
      .forRoutes({ path: "*", method: RequestMethod.ALL }); // tất cả trừ những route trên

    // Áp dụng cho controller cụ thể (NestJS tự resolve routes)
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes(UserController, ProductController);
  }
}
```

`MiddlewareConsumer` hỗ trợ chaining — bạn có thể gọi `apply()` nhiều lần và mỗi lần cấu hình một middleware khác. Thứ tự apply là thứ tự thực thi.

---

## 12. Exception Filter là gì?

Exception filter là cơ chế xử lý exception tập trung trong NestJS. Khi bất kỳ exception nào không được catch trong code của bạn (hoặc được throw có chủ ý), NestJS sẽ bắt nó và tìm exception filter phù hợp để xử lý. Filter có thể transform exception thành HTTP response, log lỗi, hoặc thực hiện side effects như notify monitoring system.

NestJS có một built-in global exception filter xử lý mọi exception. Nếu exception là instance của `HttpException`, nó trả về response theo status code và message của exception. Nếu là exception khác (unhandled), nó trả về 500 Internal Server Error. Bạn có thể override behavior này bằng custom exception filter.

```typescript
// 1. Định nghĩa custom exception
export class BusinessException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message, statusCode }, statusCode);
  }
}

// 2. Viết exception filter
@Catch(HttpException) // catch chỉ HttpException và subclasses
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === "object"
          ? (exceptionResponse as any).message
          : exceptionResponse,
    };

    this.logger.error(
      `${request.method} ${request.url} → ${status}`,
      exception.stack,
    );

    response.status(status).json(errorBody);
  }
}

// 3. Catch tất cả exception (global fallback)
@Catch() // không có argument = catch tất cả
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    // Log full error cho monitoring (Sentry, Datadog)
    if (!(exception instanceof HttpException)) {
      console.error("Unhandled exception:", exception);
      // Sentry.captureException(exception);
    }

    response.status(status).json({ statusCode: status, message });
  }
}
```

---

## 13. Binding Filter là gì? @Catch và @UseFilters

"Binding filter" là thuật ngữ chỉ hành động _gắn_ exception filter vào một scope cụ thể. NestJS có 3 level binding: method level, controller level, và global level. Mỗi level có syntax riêng.

`@Catch()` là decorator đặt trên exception filter class để chỉ định filter đó bắt loại exception nào. Nếu không truyền argument, nó bắt tất cả. Nếu truyền một hoặc nhiều class, nó chỉ bắt instances của các class đó.

`@UseFilters()` là decorator đặt trên controller hoặc method để gắn filter vào scope đó.

```typescript
// Method level — chỉ áp dụng cho method này
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() dto: CreateUserDto) {
  return this.userService.create(dto);
}

// Controller level — áp dụng cho tất cả method trong controller
@UseFilters(HttpExceptionFilter)
@Controller('users')
export class UserController { ... }

// Global level — áp dụng cho toàn bộ app
// Cách 1: trong main.ts (không có DI)
app.useGlobalFilters(new HttpExceptionFilter());

// Cách 2: qua module (có DI — inject được Logger, Config, v.v.)
@Module({
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    // Có thể đăng ký nhiều filter — thực thi theo thứ tự ngược lại
  ],
})
export class AppModule {}
```

Thứ tự ưu tiên khi nhiều filter tồn tại: method-level > controller-level > global. Nếu một filter catch được exception, các filter cấp thấp hơn không được gọi.

---

## 14. Pipes là gì — dùng cho gì?

Pipe là class thực hiện một trong hai việc: **transformation** (chuyển đổi input sang format mong muốn) hoặc **validation** (kiểm tra tính hợp lệ của input và throw exception nếu không hợp lệ). Pipe chạy ngay trước khi route handler được gọi, sau Guard và trước khi dữ liệu vào handler.

Pipe giải quyết vấn đề quan trọng: controller không nên phải lo về việc parse, validate, transform input — đó là boilerplate code lặp lại ở mọi endpoint. Pipe tách trách nhiệm đó ra.

```typescript
// 1. Built-in pipes phổ biến nhất

// ValidationPipe — validate DTO dựa trên class-validator decorators
// Nên luôn bật global với các option này
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // tự động strip properties không có trong DTO
  forbidNonWhitelisted: true, // throw error nếu có extra properties
  transform: true,        // tự động transform (string → number, v.v.)
  transformOptions: { enableImplicitConversion: true },
}));

// ParseIntPipe — đảm bảo param là integer hợp lệ
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  // id đã là number, không phải string
  return this.service.findOne(id);
}

// ParseUUIDPipe — validate UUID format
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  // throw 400 nếu id không phải UUID hợp lệ
}

// DefaultValuePipe — cung cấp default value
@Get()
findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
) { ... }

// 2. Custom pipe — validation phức tạp hơn
@Injectable()
export class PositiveIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val) || val <= 0) {
      throw new BadRequestException(
        `${metadata.data} must be a positive integer, received: ${value}`
      );
    }
    return val;
  }
}

// 3. Dùng class-validator trong DTO
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

Pipe scope tương tự filter: method level, controller level, global level. Global `ValidationPipe` là thứ bạn gần như luôn phải có trong mọi NestJS project.

---

## 15. Tại sao dùng Guards mà không dùng Middleware?

Đây là câu hỏi quan trọng về architecture. Câu trả lời ngắn gọn: vì Guard có thể đọc metadata của route handler, còn Middleware thì không.

Cụ thể hơn: khi request đến, middleware chạy trước khi NestJS routing system xác định route handler cụ thể. Ở thời điểm middleware chạy, framework chưa biết handler nào sẽ xử lý request, vì vậy middleware không thể đọc metadata được gắn lên handler đó (ví dụ: `@Roles('admin')`). Guard thì chạy sau routing, được cung cấp `ExecutionContext` — một object giàu thông tin về handler sắp được gọi, class chứa handler, HTTP method, v.v.

```typescript
// Middleware: không thể đọc metadata của handler
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // ❌ Không biết handler sắp được gọi là gì
    // ❌ Không đọc được @Roles() metadata
    // ❌ Không biết handler có @Public() decorator không
    const token = extractToken(req);
    if (token) req['user'] = verify(token);
    next();
  }
}

// Guard: có đầy đủ context về handler
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ✅ Đọc @Roles() metadata từ handler
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(), // method level metadata
      context.getClass(),   // class level metadata
    ]);

    // ✅ Nếu không có @Roles, cho qua (public endpoint)
    if (!requiredRoles) return true;

    // ✅ Kiểm tra user có role phù hợp không
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}

// Guard còn có thể switch context: HTTP, WebSocket, RPC
// Middleware chỉ làm được với HTTP
canActivate(context: ExecutionContext) {
  if (context.getType() === 'http') { /* HTTP logic */ }
  if (context.getType() === 'ws') { /* WebSocket logic */ }
  if (context.getType<GqlContextType>() === 'graphql') { /* GraphQL logic */ }
}
```

Kết luận thực tế: dùng middleware cho những việc không cần biết về route handler (logging, CORS, rate limiting, body parsing). Dùng guard cho authentication, authorization, và mọi logic cần đọc metadata từ decorators.

---

## 16. @UseGuards(new RolesGuard()) khác gì @UseGuards(RolesGuard)?

Đây là sự khác biệt giữa "instantiate bên ngoài DI" và "để DI instantiate".

Khi bạn viết `@UseGuards(new RolesGuard())`, bạn tự tạo instance của `RolesGuard` bên ngoài IoC container. Instance này không được quản lý bởi DI, vì vậy NestJS không inject bất kỳ dependency nào vào constructor của nó. Nếu `RolesGuard` có `constructor(private reflector: Reflector)`, `reflector` sẽ là `undefined` → runtime error.

Khi bạn viết `@UseGuards(RolesGuard)`, bạn truyền vào class token. NestJS sẽ dùng IoC container để resolve và instantiate guard, inject đầy đủ tất cả dependency. Đây là cách đúng khi guard có dependency.

```typescript
// ❌ Sai khi guard có dependency
@UseGuards(new RolesGuard()) // Reflector sẽ là undefined!
@Controller('admin')
export class AdminController {}

// ✅ Đúng — NestJS inject Reflector tự động
@UseGuards(RolesGuard)
@Controller('admin')
export class AdminController {}

// ✅ Cũng đúng — khi nào KHÔNG có dependency thì new cũng OK
@UseGuards(new ThrottlerGuard()) // nếu ThrottlerGuard không cần inject gì

// Hoặc khi muốn pass config trực tiếp vào constructor
export class MaxFileSizeGuard implements CanActivate {
  constructor(private readonly maxSize: number) {} // primitive, không phải DI dependency
}
@UseGuards(new MaxFileSizeGuard(5 * 1024 * 1024)) // 5MB — hoàn toàn hợp lý
```

Rule of thumb: nếu guard constructor nhận `Reflector`, `ConfigService`, hay bất kỳ NestJS provider nào, luôn dùng class token (`RolesGuard`). Nếu chỉ nhận primitive values, có thể dùng `new`.

---

## 17. @Roles là gì? Các level của Guard

`@Roles()` không phải built-in decorator của NestJS — bạn phải tự tạo nó. Đây là một _custom metadata decorator_ dùng `SetMetadata` để gắn thông tin roles vào handler hoặc controller. `RolesGuard` sau đó đọc metadata này bằng `Reflector` để quyết định có cho request qua không.

```typescript
// Tạo @Roles decorator
export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Tạo @Public decorator — bypass auth hoàn toàn
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// RolesGuard đọc metadata
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
```

**Các level của Guard** — Guard có thể được gắn ở 4 level, từ hẹp đến rộng:

**Method level** — chỉ áp dụng cho một route handler cụ thể:

```typescript
@Get('sensitive-data')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getSensitiveData() { ... }
```

**Controller level** — áp dụng cho tất cả method trong controller:

```typescript
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  @Get('users') // JwtAuthGuard tự động áp dụng
  getUsers() { ... }

  @Get('stats') // JwtAuthGuard tự động áp dụng
  getStats() { ... }
}
```

**Global level qua main.ts** — áp dụng cho toàn bộ app, không có DI:

```typescript
app.useGlobalGuards(new JwtAuthGuard());
```

**Global level qua module** — áp dụng toàn app, có DI:

```typescript
@Module({
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
```

Trong một app thực tế, bạn thường đặt `JwtAuthGuard` ở global level (bảo vệ tất cả) và dùng `@Public()` decorator để đánh dấu các route không cần auth (login, register, health check). Đây an toàn hơn là whitelist vì bạn phải chủ động đánh dấu public route thay vì bỏ sót bảo vệ.

---

## 18. AOP là gì? Interceptor làm gì?

AOP (Aspect-Oriented Programming) là paradigm lập trình cho phép bạn thêm behavior vào code mà không cần sửa code gốc, bằng cách "cắt ngang" (cross-cut) qua nhiều điểm trong application. Những behavior này gọi là "cross-cutting concerns" — logging, caching, transaction management, performance monitoring. Thay vì lặp lại code logging ở mỗi method, AOP cho phép bạn define "khi bất kỳ method nào trong service layer được gọi, hãy log trước và sau" ở một chỗ duy nhất.

NestJS implement AOP qua **Interceptors**. Interceptor là class bao quanh route handler — nó chạy code trước khi handler thực thi, rồi nhận response từ handler (dưới dạng Observable), có thể transform response, rồi trả về cho client.

```typescript
// 1. Logging interceptor — đo thời gian thực thi
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const now = Date.now();
    console.log(`→ ${req.method} ${req.url}`);

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(`← ${req.method} ${req.url} ${Date.now() - now}ms`),
        ),
      );
  }
}

// 2. Transform response — wrap tất cả response trong cùng format
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
// Mọi endpoint tự động return: { success: true, data: {...}, timestamp: "..." }

// 3. Cache interceptor
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const cacheKey = `${req.method}:${req.url}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) return of(cached); // return cached, không gọi handler

    return next.handle().pipe(
      tap((data) => this.cacheService.set(cacheKey, data, 300)), // cache 5 phút
    );
  }
}

// 4. Exception mapping interceptor
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof QueryFailedError) {
          // Map TypeORM error sang NestJS HTTP exception
          if (err.message.includes("duplicate key")) {
            return throwError(
              () => new ConflictException("Resource already exists"),
            );
          }
        }
        return throwError(() => err);
      }),
    );
  }
}
```

Interceptor scope tương tự filter và guard: method, controller, global. Global interceptor thường được dùng cho logging và response transformation. Method/controller level cho caching và specific error mapping.

---

## 19. Injection Scope

Mặc định, tất cả providers trong NestJS là singleton — được tạo một lần và sống suốt vòng đời application. Nhưng có những trường hợp cần provider với lifecycle khác. NestJS cung cấp 3 scope:

**DEFAULT (Singleton):** Một instance duy nhất được tạo, được chia sẻ bởi tất cả consumers trên toàn application. Đây là scope hiệu quả nhất về memory và performance vì không cần tạo instance mới cho mỗi request.

**REQUEST:** Một instance mới được tạo cho mỗi incoming request. Instance bị destroy sau khi request kết thúc. Rất hữu ích khi provider cần giữ trạng thái của một request cụ thể (ví dụ: current user, request ID cho distributed tracing).

**TRANSIENT:** Một instance mới được tạo cho mỗi lần inject. Nếu hai class cùng inject TransientService, mỗi class nhận một instance riêng biệt.

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

// Singleton (mặc định) — không cần khai báo
@Injectable()
export class DatabaseService { ... }

// Request-scoped — mỗi request một instance
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private requestId: string;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    // Inject request object trực tiếp
    this.requestId = request.headers['x-request-id'] || generateId();
  }

  getRequestId(): string { return this.requestId; }
  getCurrentUser(): User { return this.request['user']; }
}

// Transient — mỗi lần inject một instance
@Injectable({ scope: Scope.TRANSIENT })
export class UniqueIdService {
  private readonly id = Math.random().toString(36).substr(2, 9);
  getId() { return this.id; }
}
```

**Scope propagation** là điều cần lưu ý: nếu Provider A (singleton) inject Provider B (request-scoped), Provider A sẽ bị "nâng cấp" thành request-scoped để đảm bảo nhất quán. Scope ảnh hưởng lan truyền lên cả dependency tree. Vì vậy, request-scoped providers nên được dùng có chủ đích, không phải mặc định — dùng sai dẫn đến performance giảm vì phải recreate instance liên tục.

---

## 20. 4 tính chất của OOP

Lập trình hướng đối tượng (OOP) được xây dựng trên bốn trụ cột. Đây không chỉ là lý thuyết — hiểu sâu bốn tính chất này giúp bạn viết code dễ mở rộng và bảo trì hơn.

**Encapsulation (Đóng gói):** Đây là việc gom dữ liệu và các method thao tác trên dữ liệu đó vào một class, đồng thời ẩn đi chi tiết implementation bên trong và chỉ expose ra những gì cần thiết qua public interface. Mục đích không chỉ là "giấu data" — mục đích sâu xa hơn là bảo vệ tính nhất quán (invariants) của object. Ví dụ: `BankAccount` không để `balance` là public vì ai cũng có thể set trực tiếp về số âm. Thay vào đó, expose method `deposit(amount)` và `withdraw(amount)` với validation bên trong.

**Inheritance (Kế thừa):** Cho phép một class (subclass) kế thừa properties và methods từ class khác (superclass), tái sử dụng code và tạo ra quan hệ "is-a". Tuy nhiên, inheritance thường bị lạm dụng. Rule of thumb: dùng inheritance khi có quan hệ "is-a" thực sự (Dog IS-A Animal), không phải "has-a" (Car HAS-A Engine → dùng composition). Trong TypeScript/NestJS hiện đại, composition qua interface và dependency injection thường được ưa chuộng hơn deep inheritance chains.

**Polymorphism (Đa hình):** Cùng một interface nhưng nhiều class khác nhau implement theo cách riêng của mình. Khi code gọi `animal.makeSound()`, nó không cần biết `animal` là `Dog` hay `Cat` — mỗi class tự biết cách implement `makeSound()`. Đây là nền tảng của Open/Closed Principle và khiến code extensible mà không cần sửa caller code.

**Abstraction (Trừu tượng hóa):** Ẩn đi sự phức tạp, chỉ expose những gì thiết yếu. Khi bạn gọi `list.sort()`, bạn không cần biết thuật toán sorting nào được dùng. Interface và abstract class là công cụ implement abstraction — chúng define "what" (giao kèo), không define "how" (implementation).

```typescript
// Cả 4 tính chất trong một ví dụ thực tế NestJS

// Abstraction: interface định nghĩa contract
interface PaymentProvider {
  charge(amount: number, currency: string): Promise<PaymentResult>;
  refund(transactionId: string): Promise<void>;
}

// Encapsulation: StripeProvider quản lý state nội bộ, ẩn Stripe SDK
class StripeProvider implements PaymentProvider {
  private stripeClient: Stripe; // ẩn implementation detail

  constructor(private readonly apiKey: string) {
    this.stripeClient = new Stripe(apiKey); // logic khởi tạo bên trong
  }

  async charge(amount: number, currency: string): Promise<PaymentResult> {
    // caller không cần biết Stripe SDK được dùng thế nào
    const intent = await this.stripeClient.paymentIntents.create({
      amount: amount * 100, // Stripe dùng cents
      currency,
    });
    return { transactionId: intent.id, status: intent.status };
  }

  async refund(transactionId: string): Promise<void> {
    await this.stripeClient.refunds.create({ payment_intent: transactionId });
  }
}

// Inheritance: MomoProvider kế thừa base logic nhưng override specifics
abstract class BasePaymentProvider implements PaymentProvider {
  protected async validateAmount(amount: number): Promise<void> {
    if (amount <= 0) throw new Error("Amount must be positive");
    if (amount > 100_000_000) throw new Error("Amount exceeds limit");
  }
  abstract charge(amount: number, currency: string): Promise<PaymentResult>;
  abstract refund(transactionId: string): Promise<void>;
}

class MomoProvider extends BasePaymentProvider {
  async charge(amount: number, currency: string) {
    await this.validateAmount(amount); // dùng logic từ parent
    // ... Momo specific logic
  }
  async refund(transactionId: string) {
    /* Momo refund */
  }
}

// Polymorphism: PaymentService không biết provider cụ thể nào
@Injectable()
class PaymentService {
  constructor(@Inject("PAYMENT_PROVIDER") private provider: PaymentProvider) {}

  async processPayment(order: Order) {
    return this.provider.charge(order.total, order.currency);
    // Dù inject Stripe hay Momo, code này không đổi
  }
}
```

---

## 21. SOLID là gì?

SOLID là bộ 5 nguyên tắc thiết kế hướng đối tượng được Robert C. Martin đề xuất, nhằm tạo ra code dễ bảo trì, mở rộng, và test. Mỗi chữ cái là một nguyên tắc riêng, nhưng chúng liên kết chặt chẽ với nhau.

**S — Single Responsibility:** Một class chỉ có một lý do để thay đổi, tức là chỉ phục vụ một "actor" (người/team có thể yêu cầu sửa đổi). Nếu `UserService` vừa xử lý business logic, vừa gửi email, vừa ghi log, thì ba team khác nhau (product, email, infra) đều có thể yêu cầu sửa cùng class này vì ba lý do khác nhau → merge conflict, regression risk.

**O — Open/Closed:** Code nên mở để mở rộng (thêm tính năng mới) nhưng đóng để sửa đổi (không đụng code đang chạy tốt). Thực hiện bằng cách dùng abstract class/interface làm điểm mở rộng. Khi cần thêm Slack notification, tạo `SlackNotifier` mới, không sửa `NotificationService`.

**L — Liskov Substitution:** Subclass phải thay thế được superclass mà chương trình vẫn đúng. Không chỉ là "không crash" — subclass không được làm chặt hơn preconditions, không được làm yếu hơn postconditions. `Square extends Rectangle` vi phạm LSP vì `setWidth` và `setHeight` không còn độc lập.

**I — Interface Segregation:** Đừng ép client implement method mà nó không dùng. Nhiều interface nhỏ chuyên biệt tốt hơn một interface to ôm đồm. Hậu quả của vi phạm: class phải có method giả (empty hoặc throw), và thay đổi một method trong fat interface buộc mọi implementor phải recompile dù không liên quan.

**D — Dependency Inversion:** Module cấp cao không depend on module cấp thấp trực tiếp — cả hai depend on abstraction. Interface thuộc về client (cấp cao), không thuộc về provider (cấp thấp). Đây là cơ sở của Dependency Injection và lý do NestJS tồn tại.

---

## 22. TypeORM và Prisma — khác gì nhau?

TypeORM và Prisma đều là ORM cho TypeScript/Node.js nhưng có triết lý thiết kế hoàn toàn khác nhau.

**TypeORM** theo pattern Active Record hoặc Data Mapper, dùng class decorator để define schema ngay trong code TypeScript. Entity class vừa là domain object vừa là schema definition. Hỗ trợ nhiều database (MySQL, PostgreSQL, SQLite, MongoDB, Oracle). Query có thể dùng EntityManager, Repository, hoặc QueryBuilder — QueryBuilder rất mạnh cho complex query với nhiều join, subquery, group by.

**Prisma** dùng schema file riêng biệt (`.prisma`) viết bằng Prisma Schema Language (PSL), sau đó generate TypeScript types và client từ schema đó. Client được generate ra là fully type-safe — autocomplete cho tất cả field, relation, filter. Migration được track chặt chẽ. Tuy nhiên, Prisma không hỗ trợ Active Record pattern và raw query phức tạp đôi khi verbose hơn TypeORM QueryBuilder.

```typescript
// TypeORM — schema trong TypeScript class
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Order, (order) => order.user, { lazy: true })
  orders: Promise<Order[]>; // lazy loading với Promise

  @CreateDateColumn()
  createdAt: Date;
}

// TypeORM Query — QueryBuilder rất linh hoạt
const result = await this.userRepo
  .createQueryBuilder("u")
  .select(["u.id", "u.email", "COUNT(o.id) as orderCount"])
  .leftJoin("u.orders", "o", "o.status = :status", { status: "completed" })
  .where("u.createdAt > :date", { date: startDate })
  .groupBy("u.id")
  .having("COUNT(o.id) > :min", { min: 5 })
  .orderBy("orderCount", "DESC")
  .getRawMany();

// Prisma — schema trong .prisma file, client được generate
// schema.prisma:
// model User {
//   id        String   @id @default(uuid())
//   email     String   @unique
//   orders    Order[]
//   createdAt DateTime @default(now())
// }

// Prisma Query — type-safe, autocomplete đầy đủ
const users = await prisma.user.findMany({
  where: {
    createdAt: { gt: startDate },
    orders: { some: { status: "completed" } },
  },
  include: {
    orders: {
      where: { status: "completed" },
      select: { id: true, amount: true },
    },
  },
  orderBy: { createdAt: "desc" },
});
// users có type đầy đủ, autocomplete cho orders.amount
```

**Khi nào dùng Prisma:** project mới, team ưu tiên type-safety và developer experience, migration cần version control chặt chẽ, query không quá phức tạp.

**Khi nào dùng TypeORM:** cần raw SQL flexibility cao (complex join, window function, CTE), team đã quen Active Record pattern, cần support nhiều database engine khác nhau trong cùng project, hoặc project hiện tại đang dùng TypeORM rồi.

---

## 23. PostgreSQL và MySQL — khác gì nhau, khi nào dùng cái nào?

Cả hai đều là relational database phổ biến nhưng có khác biệt quan trọng về tính năng, performance, và triết lý thiết kế.

**PostgreSQL** là object-relational database, tức là ngoài relational model còn hỗ trợ custom data types, inheritance, và nhiều extension. PostgreSQL nổi tiếng về tính đúng đắn của SQL standard compliance, advanced query optimizer, và set tính năng phong phú. Hỗ trợ native JSONB (Binary JSON) với indexing, array type, full-text search, window functions, CTE, lateral join, partial index, expression index. Rất mạnh cho analytical query phức tạp.

**MySQL** (và MariaDB fork) tập trung vào simplicity và performance cho web workload truyền thống. Đơn giản hơn để setup, có nhiều hosting provider hỗ trợ. InnoDB storage engine hỗ trợ transactions và foreign keys. Nhưng MySQL ít strict hơn về SQL compliance (ví dụ, trước MySQL 5.7, có thể GROUP BY mà không có aggregate function), và thiếu một số advanced feature của PostgreSQL.

**Chọn PostgreSQL khi:**

- Cần JSONB để store semi-structured data với queryability (ví dụ: product attributes khác nhau theo category).
- Query phức tạp với window functions, CTE, lateral join.
- Full-text search native mà không muốn setup Elasticsearch riêng cho ứng dụng nhỏ.
- Cần geospatial data với PostGIS extension.
- Cần strict type checking và SQL compliance.

**Chọn MySQL khi:**

- Đã có infrastructure/team experience với MySQL.
- Cần tích hợp với các tool cụ thể chỉ hỗ trợ MySQL tốt (Vitess cho horizontal scaling).
- WordPress, Drupal, hoặc ecosystem PHP cũ yêu cầu MySQL.
- Simple CRUD app không cần advanced features.

Xu hướng hiện tại: PostgreSQL đang được ưa chuộng hơn cho project mới nhờ tính năng phong phú và strict compliance. MySQL vẫn phổ biến nhờ legacy và hosting support rộng.

---

## 24. Callback, Promise, Async/Await — phân biệt và xử lý lỗi

Ba cơ chế này đều giải quyết cùng một vấn đề: xử lý asynchronous operations trong JavaScript. Chúng tiến hóa theo thứ tự thời gian để giải quyết những hạn chế của cơ chế trước đó.

**Callback** là cơ chế nguyên thủy nhất: truyền một function vào một async operation, function đó sẽ được gọi khi operation hoàn thành. Theo convention Node.js, callback nhận `(error, result)` — error-first. Vấn đề lớn nhất là "callback hell" hay "pyramid of doom": khi cần thực hiện nhiều async operation tuần tự, code lồng nhau rất sâu, khó đọc và khó xử lý lỗi tập trung.

**Promise** ra đời để giải quyết callback hell bằng cách chain các operation. Promise là một object đại diện cho một giá trị chưa có — nó ở một trong ba trạng thái: pending, fulfilled, rejected. `.then()` nhận kết quả thành công, `.catch()` nhận lỗi, `.finally()` luôn chạy. Vẫn có thể bị "promise chain hell" với nhiều `.then()` lồng nhau.

**Async/Await** là syntactic sugar trên Promise. `async` function luôn return Promise. `await` pause execution của async function cho đến khi Promise resolve, nhưng không block event loop — JavaScript runtime tiếp tục xử lý việc khác trong lúc đó. Code trông giống synchronous nhưng thực sự là async. Xử lý lỗi dùng try/catch quen thuộc.

```typescript
// ---- CALLBACK ----
import fs from 'fs';

// Error-first callback convention
fs.readFile('config.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Read error:', err);
    return;
  }
  JSON.parse(data); // nếu parse fail, error không được catch!
});

// Callback hell — 3 operations tuần tự
db.query('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
  if (err) return handleError(err);
  db.query('SELECT * FROM orders WHERE user_id = ?', [user.id], (err, orders) => {
    if (err) return handleError(err);
    db.query('INSERT INTO audit_log ...', [...], (err, result) => {
      if (err) return handleError(err);
      // 3 levels deep, và còn nhiều hơn nữa
    });
  });
});

// ---- PROMISE ----
function readFilePromise(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Chaining — phẳng hơn callback hell
readFilePromise('config.json')
  .then(data => JSON.parse(data))
  .then(config => fetchUser(config.userId))
  .then(user => sendEmail(user.email))
  .catch(err => console.error('Somewhere failed:', err)) // catch mọi lỗi trong chain
  .finally(() => cleanup());

// Promise.all — chạy song song, chờ tất cả
const [users, products, orders] = await Promise.all([
  fetchUsers(),
  fetchProducts(),
  fetchOrders(),
]); // nhanh hơn chạy tuần tự 3 lần

// Promise.allSettled — chờ tất cả dù có cái fail
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
results.forEach(result => {
  if (result.status === 'fulfilled') console.log(result.value);
  else console.error(result.reason);
});

// Promise.race — lấy cái nào xong trước (dùng cho timeout)
const result = await Promise.race([
  fetchData(),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
]);

// ---- ASYNC/AWAIT ----
async function processOrder(orderId: string): Promise<OrderResult> {
  try {
    const order = await fetchOrder(orderId); // không block event loop
    const user = await fetchUser(order.userId);
    const payment = await processPayment(order.amount);
    await sendConfirmation(user.email);
    return { order, payment };
  } catch (err) {
    if (err instanceof PaymentError) {
      await refundPartial(orderId);
      throw new BadRequestException('Payment failed, partial refund initiated');
    }
    throw err; // re-throw nếu không biết handle
  } finally {
    await releaseOrderLock(orderId); // luôn chạy dù success hay fail
  }
}

// Lỗi thường gặp: await trong loop (tuần tự thay vì song song)
// ❌ Chậm: mỗi iteration chờ cái trước
for (const id of userIds) {
  const user = await fetchUser(id); // N requests tuần tự
}

// ✅ Nhanh hơn: tất cả requests song song
const users = await Promise.all(userIds.map(id => fetchUser(id)));
```

---

## 25. Event Loop, Single Thread, Non-blocking I/O, Callback Queue

Đây là cơ chế cốt lõi khiến Node.js hoạt động được dù chỉ có một thread.

**Single Thread** có nghĩa là JavaScript chỉ có một call stack — chỉ có thể thực thi một piece of code tại một thời điểm. Không có parallelism trong JavaScript code của bạn. Điều này nghe có vẻ là giới hạn lớn, nhưng được bù đắp bởi non-blocking I/O.

**Non-blocking I/O:** Khi Node.js thực hiện I/O operation (đọc file, query database, HTTP request), nó không ngồi chờ kết quả. Thay vào đó, nó đẩy operation đó xuống libuv (C++ library), tiếp tục chạy code khác, và libuv thông báo khi I/O hoàn thành. Đây là lý do một Node.js server có thể xử lý hàng nghìn concurrent connections mà không cần tạo thread mới cho mỗi connection.

**Event Loop** là vòng lặp vô tận kiểm tra xem call stack có rỗng không và có task nào trong queue không. Nếu call stack rỗng và có task trong queue, nó lấy task đó đưa lên call stack để thực thi. Event loop có nhiều phase theo thứ tự: timers (setTimeout/setInterval) → pending callbacks → idle/prepare → poll (I/O events) → check (setImmediate) → close callbacks.

**Microtask Queue vs Macrotask Queue:** Promises và queueMicrotask tạo microtask — chúng được ưu tiên hơn macrotask (setTimeout, setInterval, I/O callbacks, setImmediate). Sau mỗi macrotask, event loop drain toàn bộ microtask queue trước khi lấy macrotask tiếp theo.

```
                 ┌──────────────────────┐
                 │     Call Stack       │ ← JavaScript thực thi ở đây
                 │  (single threaded)   │
                 └──────────┬───────────┘
                            │ nếu call stack rỗng
                            ▼
  ┌─────────────────────────────────────────────┐
  │                  Event Loop                 │
  │                                             │
  │  1. Kiểm tra Microtask Queue (Priority cao) │
  │     - Promise.then callbacks                │
  │     - queueMicrotask                        │
  │     - MutationObserver                      │
  │     → Drain TOÀN BỘ trước khi tiếp tục     │
  │                                             │
  │  2. Lấy 1 task từ Macrotask Queue           │
  │     - setTimeout / setInterval callbacks    │
  │     - I/O callbacks (file, network, DB)     │
  │     - setImmediate                          │
  └─────────────────────────────────────────────┘
            ↑                   |
            |                   ▼
  ┌─────────────────┐  ┌─────────────────────┐
  │   libuv / OS    │  │   Node.js APIs      │
  │  (I/O threads)  │  │  setTimeout, etc.   │
  └─────────────────┘  └─────────────────────┘
```

```javascript
console.log("1"); // synchronous

setTimeout(() => console.log("2"), 0); // macrotask — đi vào timer queue

Promise.resolve().then(() => console.log("3")); // microtask

queueMicrotask(() => console.log("4")); // microtask

console.log("5"); // synchronous

// Output: 1, 5, 3, 4, 2
// Giải thích:
// - 1, 5: synchronous, chạy ngay trên call stack
// - Sau khi call stack rỗng, event loop kiểm tra microtask queue
// - 3, 4: microtasks (Promise và queueMicrotask), ưu tiên hơn macrotask
// - 2: macrotask (setTimeout) chạy sau khi microtask queue rỗng
```

**Tại sao CPU-intensive task làm chậm server:** Vì JavaScript single-thread, nếu bạn có một vòng lặp tính toán chạy 5 giây, event loop bị block trong 5 giây đó — không có request nào khác được xử lý. Giải pháp: Worker Threads cho CPU-intensive work, hoặc đẩy ra microservice riêng.

---

## 26. ACID là gì?

ACID là tập hợp 4 tính chất đảm bảo tính toàn vẹn của database transaction. Transaction là một nhóm operations được thực thi như một đơn vị — tất cả thành công hoặc tất cả thất bại.

**Atomicity (Nguyên tử tính):** Tất cả operations trong một transaction hoặc đều được commit (thành công), hoặc đều bị rollback (thất bại). Không có trạng thái trung gian. Ví dụ: chuyển tiền ngân hàng có hai bước: trừ tài khoản A và cộng tài khoản B. Nếu bước 2 fail sau khi bước 1 đã thực hiện, atomicity đảm bảo bước 1 cũng bị hoàn tác — tiền không biến mất.

**Consistency (Nhất quán):** Transaction chỉ có thể đưa database từ một trạng thái hợp lệ sang một trạng thái hợp lệ khác. Mọi constraint, rule, và trigger phải được thỏa mãn trước và sau transaction. Ví dụ: nếu có constraint `balance >= 0`, transaction sẽ fail nếu cố gắng tạo ra balance âm, dù các bước trước đó đã thực thi.

**Isolation (Cô lập):** Các transaction đang chạy đồng thời không nhìn thấy thay đổi chưa commit của nhau. Mức độ isolation có thể cấu hình (isolation level) vì isolation tuyệt đối (serializable) ảnh hưởng performance. Có 4 mức: Read Uncommitted, Read Committed (default PostgreSQL), Repeatable Read (default MySQL InnoDB), Serializable.

**Durability (Bền vững):** Một khi transaction đã committed, data được đảm bảo persist kể cả khi system crash ngay sau đó. Database đạt điều này bằng cách ghi WAL (Write-Ahead Log) — mọi thay đổi được ghi vào log trước khi apply vào actual data pages.

```typescript
// Ví dụ transaction với TypeORM — đảm bảo ACID cho transfer tiền
@Injectable()
export class TransactionService {
  constructor(private readonly dataSource: DataSource) {}

  async transferFunds(fromId: string, toId: string, amount: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction("REPEATABLE READ"); // isolation level

    try {
      // Atomicity: nếu bất kỳ bước nào fail, toàn bộ rollback
      const sender = await queryRunner.manager.findOne(Account, {
        where: { id: fromId },
        lock: { mode: "pessimistic_write" }, // prevent race condition
      });

      if (!sender || sender.balance < amount) {
        throw new BadRequestException("Insufficient funds");
      }

      // Consistency: database constraint CHECK (balance >= 0) sẽ bắt lỗi nếu âm
      await queryRunner.manager.decrement(
        Account,
        { id: fromId },
        "balance",
        amount,
      );
      await queryRunner.manager.increment(
        Account,
        { id: toId },
        "balance",
        amount,
      );

      // Ghi audit log trong cùng transaction — atomicity đảm bảo đồng bộ
      await queryRunner.manager.save(AuditLog, {
        type: "TRANSFER",
        fromId,
        toId,
        amount,
        timestamp: new Date(),
      });

      await queryRunner.commitTransaction(); // Durability: WAL ghi xuống disk
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Atomicity: hoàn tác tất cả
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

---

## 27. Thiết kế hệ thống với WebSocket, RabbitMQ, Redis, Microservice

Giả sử cần thiết kế hệ thống quản lý project nội bộ (như Jira clone) với real-time updates, background jobs, caching, và microservice architecture. Đây là blueprint và luồng chạy cụ thể.

**Tổng quan kiến trúc:**

```
Client (Browser)
     |
     | HTTP / WebSocket
     ▼
API Gateway (NestJS)
  ├── Auth Service     (JWT validation)
  ├── Project Service  (CRUD projects, tasks)
  ├── Notification Service (WebSocket, push)
  └── Report Service   (async report generation)
          |
     RabbitMQ (Message Broker)
          |
     Worker Services (consumers)
          |
     PostgreSQL (primary data)
     Redis (cache + session + WS adapter)
     MinIO/S3 (file storage)
```

**Luồng 1: User tạo task và team nhận notification real-time**

```
1. User POST /tasks { title, assigneeId, projectId }
2. API Gateway → ProjectService.createTask()
3. ProjectService:
   a. Validate user có quyền tạo task trong project này (check Redis cache trước, miss → query DB)
   b. INSERT task vào PostgreSQL (trong transaction)
   c. Publish event "task.created" lên RabbitMQ exchange
   d. Return task data về client ngay (không chờ notification)
4. RabbitMQ route event đến 2 queues:
   a. notification.queue → NotificationService consume
   b. audit.queue → AuditService consume
5. NotificationService:
   a. Lấy danh sách members của project (từ Redis cache nếu có)
   b. Với mỗi member đang online: emit WebSocket event "task.created" đến room "project:{projectId}"
   c. Với member offline: lưu notification vào DB để show khi họ login lại
6. WebSocket emit đến client: { type: "task.created", task: {...} }
7. Client React store update, UI hiển thị task mới cho tất cả member đang xem project
```

**Luồng 2: Export report async**

```
1. User POST /reports/export { projectId, dateRange, format: "pdf" }
2. API Gateway validate, return 202 Accepted + { jobId }
3. Đẩy job vào RabbitMQ: report.generation.queue
4. ReportWorker (scale horizontal, 3 instances) consume:
   a. Fetch data từ PostgreSQL (paginated để không OOM)
   b. Generate PDF với Puppeteer
   c. Upload lên MinIO
   d. Update job status trong Redis: "jobId:status" = "DONE"
   e. Publish "report.ready" event
5. NotificationService consume "report.ready":
   a. Emit WebSocket "report.ready" { downloadUrl } đến user
6. Client hiển thị toast: "Report ready! Click to download"
```

**WebSocket scaling với Redis:**

```typescript
// Vấn đề: User A connect Server 1, User B connect Server 2
// Server 1 emit event → User B (ở Server 2) không nhận được

// Giải pháp: Redis Pub/Sub Adapter
// Khi Server 1 emit → publish lên Redis channel
// Server 2 subscribe Redis channel → nhận → forward tới clients của mình

// NestJS config
const pubClient = new Redis(redisConfig);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

**Microservice communication với RabbitMQ:**

```typescript
// Event-driven (fire and forget)
this.rmqClient.emit("task.created", { taskId, projectId, assigneeId });

// Request-response (cần kết quả)
const user = await firstValueFrom(
  this.rmqClient.send({ cmd: "get_user" }, { userId }).pipe(timeout(5000)),
);
```

---

## 28. N+1 Problem là gì và cách giải quyết

N+1 problem là một trong những bug performance phổ biến nhất khi làm việc với ORM. Tên gọi xuất phát từ pattern: 1 query để lấy N items, rồi N queries riêng biệt để lấy related data của từng item — tổng cộng N+1 queries.

```typescript
// Ví dụ điển hình: lấy 10 posts với tên author của mỗi post

// ❌ N+1: 1 query lấy posts + 10 queries lấy author
const posts = await postRepo.find({ take: 10 }); // Query 1: SELECT * FROM posts LIMIT 10
for (const post of posts) {
  const author = await post.author; // Query 2-11: SELECT * FROM users WHERE id = ?
  console.log(author.name);
}
// Tổng: 11 queries

// Phát hiện: enable TypeORM logging
TypeOrmModule.forRoot({
  logging: ["query"], // log tất cả queries ra console
});
// Hoặc dùng pg_stat_statements trong PostgreSQL để track query patterns

// ✅ Fix 1: Eager loading với relations
const posts = await postRepo.find({
  take: 10,
  relations: ["author", "author.profile"], // JOIN trong 1 query
});

// ✅ Fix 2: QueryBuilder với explicit JOIN
const posts = await postRepo
  .createQueryBuilder("post")
  .leftJoinAndSelect("post.author", "author")
  .leftJoinAndSelect("post.tags", "tag")
  .take(10)
  .getMany();

// ✅ Fix 3 với Prisma — include luôn JOIN
const posts = await prisma.post.findMany({
  take: 10,
  include: {
    author: { select: { id: true, name: true, avatar: true } },
    tags: true,
    _count: { select: { comments: true } }, // count comments, không fetch all
  },
});

// ✅ Fix 4: DataLoader pattern (quan trọng với GraphQL)
// Batch nhiều individual requests thành 1 query
class UserDataLoader extends DataLoader<string, User> {
  constructor(private userRepo: UserRepository) {
    super(async (userIds: readonly string[]) => {
      const users = await userRepo.findByIds([...userIds]);
      // Map về đúng thứ tự của keys
      return userIds.map((id) => users.find((u) => u.id === id) ?? null);
    });
  }
}
// Thay vì 10 queries riêng, loader batch thành:
// SELECT * FROM users WHERE id IN ('id1', 'id2', ..., 'id10')
```

**Cách phòng tránh từ đầu:**

- Luôn dùng explicit `relations` hoặc `include` khi biết sẽ cần related data.
- Chọn lọc data với `select` — không fetch cả object khi chỉ cần 2-3 fields.
- Enable query logging trong development để phát hiện sớm.
- Dùng `EXPLAIN ANALYZE` để verify query plan trước khi deploy.
- Với GraphQL, DataLoader là bắt buộc.

---

## 29. Chuyện gì xảy ra khi nhập URL lên browser?

Đây là câu hỏi kinh điển bao gồm nhiều tầng kỹ thuật từ networking đến rendering. Hãy đi qua từng bước chi tiết.

**Bước 1 — Parse URL:** Browser phân tích URL `https://example.com/products?page=1` thành: protocol (`https`), host (`example.com`), path (`/products`), query string (`page=1`). Kiểm tra URL có hợp lệ không, có phải search query không (nếu không có domain format, browser dùng search engine thay vì navigate).

**Bước 2 — Check cache:** Browser kiểm tra HSTS preload list (danh sách domain buộc HTTPS). Kiểm tra DNS cache của browser. Kiểm tra OS DNS cache. Kiểm tra router DNS cache. Nếu tất cả miss, mới thực hiện DNS lookup.

**Bước 3 — DNS Resolution:** Browser hỏi DNS resolver (thường là router/ISP) "IP của example.com là gì?". Resolver hỏi Root DNS servers → TLD DNS servers (.com) → Authoritative DNS servers của example.com. Nhận về IP address (ví dụ: 93.184.216.34). Kết quả được cache với TTL từ DNS record. Ngày nay nhiều browser dùng DNS-over-HTTPS (DoH) để encrypt DNS query.

**Bước 4 — TCP Connection:** Browser dùng IP vừa có để thiết lập TCP connection đến port 443 (HTTPS). TCP three-way handshake: SYN (client) → SYN-ACK (server) → ACK (client). Connection được thiết lập.

**Bước 5 — TLS Handshake:** Vì HTTPS, cần thêm TLS handshake. Client hello (TLS version, cipher suites support). Server hello (chọn cipher suite, gửi certificate). Client verify certificate (check CA signature, expiry, domain match). Key exchange (Diffie-Hellman để tạo session key mà không truyền key qua mạng). Từ đây mọi data được encrypt. TLS 1.3 giảm handshake xuống còn 1 round-trip thay vì 2 của TLS 1.2.

**Bước 6 — HTTP Request:** Browser gửi HTTP GET request qua encrypted channel. Request gồm: method, path, HTTP version, headers (Host, Accept, Cookie, Accept-Encoding, User-Agent, Referer, If-Modified-Since nếu có cached version cũ).

**Bước 7 — Server xử lý:** Request đến Load Balancer → forward đến App Server → NestJS/Express nhận request → routing → controller → service → database query → trả về response. Response gồm status code, headers (Content-Type, Cache-Control, Set-Cookie, ETag), và body.

**Bước 8 — Browser nhận response và parse HTML:** Browser nhận HTML. Parser đọc từ trên xuống, xây dựng DOM tree. Khi gặp `<link rel="stylesheet">`, download CSS (blocking). Khi gặp `<script>` không có `async`/`defer`, pause HTML parsing, execute script, rồi tiếp tục. Khi gặp `<img>`, download asynchronously không block parsing.

**Bước 9 — CSSOM và Render Tree:** Browser xây dựng CSSOM (CSS Object Model) từ stylesheets. Combine DOM + CSSOM thành Render Tree (chỉ gồm visible elements — `display: none` bị exclude). Tính toán layout (kích thước, vị trí của mỗi element) — gọi là "reflow". Paint từng layer xuống screen — gọi là "repaint". Composite các layer (GPU-accelerated).

**Bước 10 — JavaScript execution:** V8 engine parse và compile JavaScript. Execute scripts. React/Vue hydrate DOM. Event listeners được gắn. Single Page App có thể trigger thêm XHR/fetch requests để load data.

**Tối ưu quan trọng:** HTTP/2 multiplexing cho phép nhiều request trên cùng một TCP connection. HTTP/3 (QUIC) dùng UDP thay TCP, giảm latency. Service Worker có thể intercept request và trả về cached response. CDN serve static assets từ node gần người dùng nhất.

---

## 30. Kiến trúc Docker — Container, Image, Docker Compose

**Docker Image** là một read-only template chứa tất cả những gì cần thiết để chạy application: OS base (Alpine Linux thường chỉ 5MB), runtime (Node.js), dependencies (node_modules), và application code. Image được build từ Dockerfile — một script mô tả từng lớp (layer) được thêm vào. Mỗi instruction trong Dockerfile tạo một layer. Layer được cache — nếu layer không thay đổi, Docker dùng cache, chỉ rebuild layer thay đổi và tất cả layer sau nó.

**Docker Container** là một running instance của image. Container là isolated environment với filesystem riêng (từ image + writable layer), process namespace riêng, network namespace riêng. Container không mang theo OS kernel — nó dùng chung kernel của host nhưng isolated qua Linux namespaces và cgroups. Điều này khiến container nhẹ hơn VM rất nhiều (khởi động trong milliseconds, không phải phút).

**Tại sao dùng Docker:**

- **"Works on my machine" eliminated:** Image chứa đủ mọi dependency, chạy giống nhau trên mọi môi trường từ laptop developer đến production server.
- **Isolation:** Mỗi container có dependencies riêng, không conflict. Node.js 18 cho app A, Node.js 20 cho app B, chạy song song trên cùng host.
- **Resource efficiency:** Nhiều container chia sẻ OS kernel, nhẹ hơn VM nhiều.
- **Scalability:** Dễ horizontal scale bằng cách chạy thêm container từ cùng image.
- **Immutable infrastructure:** Deploy = push image mới, rollback = revert về image cũ.

```dockerfile
# Multi-stage build — production image tối ưu
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                    # install tất cả (kể cả devDependencies)
COPY . .
RUN npm run build             # compile TypeScript → dist/

FROM node:20-alpine AS production
WORKDIR /app
# Chỉ copy những gì production cần
COPY package*.json ./
RUN npm ci --omit=dev         # chỉ production dependencies
COPY --from=builder /app/dist ./dist

# Security: không chạy với root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

**Docker Compose** là tool để define và run multi-container applications. Thay vì chạy nhiều `docker run` commands với đầy đủ options, bạn describe toàn bộ stack trong một file YAML và chạy một lệnh `docker compose up`.

```yaml
# docker-compose.yml cho local development
services:
  api:
    build:
      context: .
      target: builder # dùng builder stage (có devDeps, hot reload)
    volumes:
      - ./src:/app/src # mount source code → hot reload
      - ./test:/app/test
    command: npm run start:dev
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://postgres:secret@postgres:5432/devdb
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://admin:secret@rabbitmq:5672
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data # persist data
    environment:
      POSTGRES_DB: devdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes # persistence
    volumes:
      - redis_data:/data
    networks:
      - app-network

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "15672:15672" # management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: secret
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  app-network:
    driver: bridge
```

---

## 31. Cách giải quyết khi database query chậm

Query chậm là một trong những vấn đề phổ biến nhất trong production. Cần một quy trình có hệ thống thay vì đoán mò.

**Bước 1 — Đo lường và xác định query chậm:**

```sql
-- PostgreSQL: tìm query chậm nhất trong 24h qua
SELECT query, calls, mean_exec_time, total_exec_time,
       rows, shared_blks_hit, shared_blks_read
FROM pg_stat_statements
WHERE mean_exec_time > 100    -- query > 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Hoặc enable slow query log
-- postgresql.conf:
-- log_min_duration_statement = 100    # log query > 100ms
-- log_statement = 'all'               # hoặc log tất cả
```

**Bước 2 — EXPLAIN ANALYZE:**

```sql
-- EXPLAIN: chỉ show execution plan (không thực sự chạy)
-- EXPLAIN ANALYZE: chạy thật và show actual time + rows
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT o.*, u.name, u.email
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.status = 'pending'
  AND o.created_at > NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;

-- Đọc output: tìm các dấu hiệu xấu:
-- "Seq Scan" trên bảng lớn → cần index
-- "rows=1000000" nhưng "actual rows=10" → estimate sai → cần ANALYZE
-- "Hash Join" với nhiều rows → có thể optimize thành "Nested Loop" với index đúng
-- "Sort" tốn nhiều memory → cần index có ORDER BY phù hợp
```

**Bước 3 — Thêm index đúng cách:**

```sql
-- Index thường dùng
CREATE INDEX idx_orders_status_created
ON orders(status, created_at DESC)    -- composite, match WHERE + ORDER BY
WHERE status = 'pending';             -- partial index — chỉ index pending orders

-- Covering index — index chứa luôn data cần SELECT, tránh heap fetch
CREATE INDEX idx_orders_covering
ON orders(user_id, created_at DESC)
INCLUDE (id, status, total_amount);  -- INCLUDE columns không dùng để filter

-- Index cho JSONB
CREATE INDEX idx_products_metadata_category
ON products USING gin((metadata -> 'category'));  -- GIN cho JSONB containment

-- Check index có được dùng không
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'orders'
ORDER BY idx_scan DESC;
-- idx_scan = 0 → index không được dùng → có thể drop
```

**Bước 4 — Query optimization:**

```sql
-- Tránh function trong WHERE clause (ngăn index usage)
-- ❌ Không dùng index trên created_at
WHERE DATE(created_at) = '2024-01-01'

-- ✅ Dùng range comparison
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'

-- Tránh SELECT * — fetch chỉ những column cần
-- ❌
SELECT * FROM users WHERE id = $1;
-- ✅
SELECT id, name, email FROM users WHERE id = $1;

-- Pagination: dùng cursor thay vì OFFSET lớn
-- ❌ Chậm khi offset lớn (phải skip 100000 rows)
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 100000;

-- ✅ Cursor-based pagination
SELECT * FROM posts
WHERE created_at < :lastSeenCursor
ORDER BY created_at DESC
LIMIT 20;
```

**Bước 5 — Application-level caching với Redis:**

```typescript
@Injectable()
export class ProductService {
  constructor(
    private readonly redis: Redis,
    private readonly productRepo: ProductRepository,
  ) {}

  async findAll(filters: ProductFilters): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const products = await this.productRepo.find(filters);
    await this.redis.setex(cacheKey, 300, JSON.stringify(products)); // 5 phút
    return products;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.update(id, dto);
    // Invalidate cache khi data thay đổi
    const keys = await this.redis.keys("products:*");
    if (keys.length) await this.redis.del(keys);
    return product;
  }
}
```

**Bước 6 — Database-level optimization:**

```sql
-- VACUUM ANALYZE: cập nhật statistics và reclaim dead tuples
VACUUM ANALYZE orders;

-- Autovacuum tuning (cho bảng write-heavy)
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.01,  -- vacuum khi 1% rows là dead
  autovacuum_analyze_scale_factor = 0.005
);

-- Table partitioning cho bảng rất lớn (hàng tỷ rows)
CREATE TABLE orders (
  id UUID,
  created_at TIMESTAMPTZ,
  ...
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2024_q1 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
-- Query với WHERE created_at IN 2024_q1 chỉ scan partition đó
```

---

## 32. CQRS Pattern trong NestJS

CQRS (Command Query Responsibility Segregation) là pattern tách biệt hoàn toàn hai loại operation: **Command** (write operations — thay đổi state) và **Query** (read operations — đọc state mà không thay đổi). Tên gọi xuất phát từ nguyên tắc của Bertrand Meyer: một method nên hoặc là command (thực hiện action) hoặc là query (trả về data), không bao giờ cả hai.

**Tại sao dùng CQRS:**

Trong ứng dụng thông thường, cùng một model được dùng cho cả đọc và ghi. Khi business phức tạp lên, đây là nguồn gốc của nhiều vấn đề. Write operations cần business logic phức tạp, validation, domain events, transactional consistency. Read operations thường cần denormalized data, join nhiều table, pagination, sorting — những thứ cần tối ưu khác với write. CQRS giải phóng bạn khỏi sự compromise này bằng cách dùng model riêng cho từng hướng.

```typescript
// ---- Cài đặt CQRS trong NestJS ----
// npm install @nestjs/cqrs

// 1. COMMAND — biểu diễn ý định thay đổi state
// Command chỉ là plain object chứa data cần thiết
export class CreateTaskCommand {
  constructor(
    public readonly projectId: string,
    public readonly title: string,
    public readonly assigneeId: string,
    public readonly createdBy: string,
  ) {}
}

// 2. COMMAND HANDLER — thực thi command, chứa business logic
@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly eventBus: EventBus, // publish domain events
    private readonly projectService: ProjectService,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    // Business logic: validate
    const project = await this.projectService.findById(command.projectId);
    if (!project.isActive()) {
      throw new BadRequestException("Cannot create task in inactive project");
    }

    // Create aggregate
    const task = Task.create({
      projectId: command.projectId,
      title: command.title,
      assigneeId: command.assigneeId,
      createdBy: command.createdBy,
      status: TaskStatus.TODO,
    });

    const saved = await this.taskRepo.save(task);

    // Publish domain event — decoupled notification
    this.eventBus.publish(new TaskCreatedEvent(saved.id, command.assigneeId));

    return saved;
  }
}

// 3. QUERY — biểu diễn yêu cầu đọc data
export class GetProjectTasksQuery {
  constructor(
    public readonly projectId: string,
    public readonly filters: TaskFilters,
    public readonly pagination: PaginationDto,
  ) {}
}

// 4. QUERY HANDLER — tối ưu cho read, có thể dùng raw SQL hay denormalized view
@QueryHandler(GetProjectTasksQuery)
export class GetProjectTasksHandler implements IQueryHandler<
  GetProjectTasksQuery,
  PaginatedResult<TaskDto>
> {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    query: GetProjectTasksQuery,
  ): Promise<PaginatedResult<TaskDto>> {
    // Query handler có thể bypass ORM để dùng raw SQL tối ưu hơn
    const result = await this.dataSource.query(
      `
      SELECT
        t.id, t.title, t.status, t.priority, t.due_date,
        u.name AS assignee_name, u.avatar AS assignee_avatar,
        COUNT(c.id) AS comment_count
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assignee_id
      LEFT JOIN comments c ON c.task_id = t.id
      WHERE t.project_id = $1
        AND ($2::text IS NULL OR t.status = $2)
      GROUP BY t.id, u.name, u.avatar
      ORDER BY t.created_at DESC
      LIMIT $3 OFFSET $4
    `,
      [
        query.projectId,
        query.filters.status,
        query.pagination.limit,
        query.pagination.offset,
      ],
    );

    return { data: result, total: result.length };
  }
}

// 5. DOMAIN EVENT — side effects được xử lý tách biệt
export class TaskCreatedEvent {
  constructor(
    public readonly taskId: string,
    public readonly assigneeId: string,
  ) {}
}

@EventsHandler(TaskCreatedEvent)
export class TaskCreatedHandler implements IEventHandler<TaskCreatedEvent> {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
  ) {}

  async handle(event: TaskCreatedEvent) {
    // Side effects chạy async, không block command
    await Promise.all([
      this.notificationService.notifyAssignee(event.assigneeId, event.taskId),
      this.auditService.log("TASK_CREATED", event.taskId),
    ]);
  }
}

// 6. CONTROLLER sử dụng CommandBus và QueryBus
@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTaskDto, @CurrentUser("id") userId: string) {
    return this.commandBus.execute(
      new CreateTaskCommand(dto.projectId, dto.title, dto.assigneeId, userId),
    );
  }

  @Get("project/:projectId")
  async findAll(
    @Param("projectId") projectId: string,
    @Query() filters: TaskFilters,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new GetProjectTasksQuery(projectId, filters, pagination),
    );
  }
}

// 7. Module setup
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Task])],
  controllers: [TaskController],
  providers: [CreateTaskHandler, GetProjectTasksHandler, TaskCreatedHandler],
})
export class TaskModule {}
```

**Khi nào nên dùng CQRS:**

Dùng CQRS khi domain phức tạp với nhiều business rule, khi read và write model khác nhau đáng kể (cần denormalized read model), khi muốn scale read và write độc lập (ví dụ read replica cho queries), khi cần audit trail qua event log, khi team đủ lớn để maintain complexity tăng thêm.

**Khi không nên dùng CQRS:**

CQRS tăng complexity đáng kể — nhiều class hơn, nhiều abstraction layer hơn, harder to trace code flow. Với CRUD đơn giản, single developer, hoặc deadline gấp, overhead này không đáng. Martin Fowler nói: "CQRS là significant mental leap" và khuyên chỉ dùng cho bounded context thực sự phức tạp, không phải toàn bộ hệ thống.

---

_Tài liệu này cung cấp nền tảng lý thuyết và thực hành cho backend development với NestJS. Mỗi concept ở đây nên được practice bằng cách build feature thực tế, không chỉ đọc._
