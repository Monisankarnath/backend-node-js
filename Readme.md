# Backend in node

Learning backend advanced concepts in nodejs

### Learning Concepts -

#### Creating Models using mongoose

- While creating mongoose schema just making timestamps true adds createdAt and updatedAt field.
- MongoDB is a smart database which names the database plural of what you named, example User becomes "users", Category becomes "categories", Products becomes "products".
- You can create array of schemas using below format, where ref is a must to add if you give type as mongoose.Schema.Types.ObjectId and SubTodo is the name of the sub model -

```js
   subTodos: [
     {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'SubTodo',
     },
   ],
```

- It is also possible to keep a default error message if the schema is not satisfied -

```js
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
```

- We can add sub schemas and enums like this also if it is only being used in the current file -

```js
import mongoose from "mongoose";

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
  },
});
const orderSchema = new mongoose.Schema(
  {
    orderPrice: {
      type: Number,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: {
      type: [orderItemSchema], // array of orderItemsSchema
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CANCELLED", "DELIVERED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
```

#### Connecting to Mongo Database

- Connection to the db must be the first thing to do for which we can use the index.js file which gets invoked the first. There are 2 ways we can call the connectDB method - Immediately Invoked Functional Expression(IIFE) or Promises. We can exit with throw or process.exit() but we need to give a code like 1 to exit() otherwise there might be some async code that keeps on running even after the process is exited.

#### Plugins Used

- mongoose aggregate paginate can be used to write aggregation queries and bring out the true power of mongoose.
- bcrypt is used to encrypt or decrypt sensitive data like password.
- jsonwetoken is used for accesstoken and refreshtoken.
- cookie parser is used to save or delete the cookies saved on the client browser.
- Cloudinary is used to save the file and use the url to save in the db for user.
- multer is used to handle the file uploads to external platforms.

#### Models

- Using pre hooks before we export the model for saving password after encryption
- We can add any number of methods -

```js
userSchema.methods.generateAccessToken = function () {};
```

#### Middleware

- Can take upto 4 parameters in the callbacks - err, req, res, next. The 3 standard ones are req, res and next whereas the err parameter is used in error handling middlewares mostly.

```js
// error handling middle ware
app.use((err, req, res, next) => {
  res.status("500").json({ error: err.message });
});

// application handling middleware
app.use((req, res, next) => {
  console.log("Here comes all the code and logic");
  next();
});
```

- req(request) : query, params, headers, method, body, cookies, url
- res(response) : send(), json(), status(), redirect(), cookies(), set(), render()
- next(Next) :
  - next() - passes the control to the next middleware
  - next('route') - skips the remaining middleware in the current route and passes control to next route
  - next('err') - passes the control to the next error middleware
