## DELETE - articles/

Deleats the article and its image from the Database and S3.

### Query Params

- id
  - Type: String
  - Required: True
  - Description: ID of the article
- visibility
  - Type: String
  - Required: False
  - Default: "public"
  - Allowed Values: "public" || "private"
  - Description: Specifies which table to query - ArticlesPublished or ArticlesUnpublished

## POST - articles/publish

Publishes the article, moves the article from ArticlesUnpublished to ArticlesPublished

### Query Params

- id
  - Type: String
  - Required: True
  - Description: ID of the article

## GET - articles/get

Fetches an entire article from the S3

### Query Params

- id
  - Type: String
  - Required: True
  - Description: ID of the article
- visibility
  - Type: String
  - Required: False
  - Default: "public"
  - Allowed Values: "public" || "private"
  - Description: Specifies which table to query - ArticlesPublished or ArticlesUnpublished

## GET - articles/author

Queries the database by the author value. Additionaly it can sort by date or rating in an ascending or descending order.

### Query Params

- authorName
  - Type: String
  - Required: True
  - Description: The name of the author
- visibility
  - Type: String
  - Required: False
  - Default: "public"
  - Allowed Values: "public" || "private"
  - Description: Specifies which table to query - ArticlesPublished or ArticlesUnpublished
- searchBy
  - Type: String
  - Required: False
  - Default: "rating"
  - Allowed Values: "rating" || "date"
  - Description: Specifies if the database results should be ordered by date or by rating
- sortBy
  - Type: String
  - Required: False
  - Default: "highest:
  - Allowed Values: "highest" || "lowest"
  - Description: Specifies if the results should be shown in an ascending or descending order
- page
  - Type: Number
  - Required: False
  - Default: 1
  - Allowed Values: page > 0
  - Description: Specifies which page of pagination to show
- limit
  - Type: Number
  - Required: False
  - Default: 10
  - Allowed Values: limit > 0
  - Description: Specifies how many articles per page to show

## GET - articles/title

Queries the database by the title value. Additionaly it can sort by date or rating in an ascending or descending order.

### Query Params

- title
  - Type: String
  - Required: True
  - Description: The title of the article
- visibility
  - Type: String
  - Required: False
  - Default: "public"
  - Allowed Values: "public" || "private"
  - Description: Specifies which table to query - ArticlesPublished or ArticlesUnpublished
- searchBy
  - Type: String
  - Required: False
  - Default: "rating"
  - Allowed Values: "rating" || "date"
  - Description: Specifies if the database results should be ordered by date or by rating
- sortBy
  - Type: String
  - Required: False
  - Default: "highest:
  - Allowed Values: "highest" || "lowest"
  - Description: Specifies if the results should be shown in an ascending or descending order
- page
  - Type: Number
  - Required: False
  - Default: 1
  - Allowed Values: page > 0
  - Description: Specifies which page of pagination to show
- limit
  - Type: Number
  - Required: False
  - Default: 10
  - Allowed Values: limit > 0
  - Description: Specifies how many articles per page to show

## GET - articles/:categoryName

Queries the database by the category value. Additionaly it can sort by date or rating in an ascending or descending order.

### URL Params

- :categoryName
  - Type: String
  - Description: Name of the category

### Query Params

- visibility
  - Type: String
  - Required: False
  - Default: "public"
  - Allowed Values: "public" || "private"
  - Description: Specifies which table to query - ArticlesPublished or ArticlesUnpublished
- searchBy
  - Type: String
  - Required: False
  - Default: "rating"
  - Allowed Values: "rating" || "date"
  - Description: Specifies if the database results should be ordered by date or by rating
- sortBy
  - Type: String
  - Required: False
  - Default: "highest:
  - Allowed Values: "highest" || "lowest"
  - Description: Specifies if the results should be shown in an ascending or descending order
- page
  - Type: Number
  - Required: False
  - Default: 1
  - Allowed Values: page > 0
  - Description: Specifies which page of pagination to show
- limit
  - Type: Number
  - Required: False
  - Default: 10
  - Allowed Values: limit > 0
  - Description: Specifies how many articles per page to show

## GET - articles/:categoryName/:difficulty

Queries the database by the category and difficulty value.

### URL Params

- :categoryName
  - Type: String
  - Description: Name of the category
- :difficulty
  - Type: String
  - Allowed Values: "EASY" || "MEDIUM" || "HARD"
  - Description: Difficulty level of the articles

### Query Params

- visibility
  - Type: String
  - Required: False
  - Default: "public"
  - Allowed Values: "public" || "private"
  - Description: Specifies which table to query - ArticlesPublished or ArticlesUnpublished
- page
  - Type: Number
  - Required: False
  - Default: 1
  - Allowed Values: page > 0
  - Description: Specifies which page of pagination to show
- limit
  - Type: Number
  - Required: False
  - Default: 10
  - Allowed Values: limit > 0
  - Description: Specifies how many articles per page to show

## POST - articles/

Posts an article to the ArticlesUnpublished table.

### JSON SCHEMA

- body: String,
- metadata:
  - Title: String,
  - Description: String,
  - Author: String,
  - PrimaryCategory: String,
  - SecondaryCategories: String[],
  - Rating: Number,
  - Difficulty: String,
  - CreatedAt: Number,
  - UpdatedAt: Number,

### JSON DESCRIPTION

- body
  - Required: True
  - Description: The article content - body
- metadata:
  - Required: True
  - Description: Holds all the properties about an article
- Title
  - Required: True
  - Description: The title of the article
- Description
  - Required: True
  - Description: The description of the article
- Author
  - Required: True
  - Description: The author of the article
- PrimaryCategory
  - Required: True
  - Description: The primary category of the article
- SecondaryCategory
  - Required: True
  - Description: A list of secondary categories
- Rating
  - Required: True
  - Description: The rating of the article
- Difficulty
  - Required: True
  - Allowed Values: "EASY" || "MEDIUM" || "HARD"
  - Description: The difficulty rating of the article
- CreatedAt
  - Required: False
  - Default: Current UNIX time
  - Description: The creation time of the article in an UNIX format
- UpdatedAt
  - Required: False
  - Default: null
  - Description: The last time the article got updated in an UNIX format

## PUT - articles/

Replaces an article with a new version.

### Query Params

- visibility
  - Type: String
  - Required: False
  - Default: "public"
  - Allowed Values: "public" || "private"
  - Description: Specifies which table to query - ArticlesPublished or ArticlesUnpublished

### JSON SCHEMA

- body: String,
- metadata:
  - Title: String,
  - Description: String,
  - Author: String,
  - PrimaryCategory: String,
  - SecondaryCategories: String[],
  - Rating: Number,
  - Difficulty: String,
  - CreatedAt: Number,
  - UpdatedAt: Number,

### JSON DESCRIPTION

- body
  - Required: True
  - Description: The article content - body
- metadata:
  - Required: True
  - Description: Holds all the properties about an article
- Title
  - Required: True
  - Description: The title of the article
- Description
  - Required: True
  - Description: The description of the article
- Author
  - Required: True
  - Description: The author of the article
- PrimaryCategory
  - Required: True
  - Description: The primary category of the article
- SecondaryCategory
  - Required: True
  - Description: A list of secondary categories
- Rating
  - Required: True
  - Description: The rating of the article
- Difficulty
  - Required: True
  - Allowed Values: "EASY" || "MEDIUM" || "HARD"
  - Description: The difficulty rating of the article
- CreatedAt
  - Required: False
  - Default: Current UNIX time
  - Description: The creation time of the article in an UNIX format
- UpdatedAt
  - Required: False
  - Default: null
  - Description: The last time the article got updated in an UNIX format

## POST - articles/image

Saves an image to S3 and attaches it to an article.

### Form Data

- image
  - Type: image/\*
  - Required: True
  - Description: The file to be attached to an article

### Query Params

- id
  - Type: String
  - Required: True
  - Description: ID of the article
- visibility
  - Type: String
  - Required: False
  - Default: "public"
  - Allowed Values: "public" || "private"
  - Description: Specifies which table to query - ArticlesPublished or ArticlesUnpublished
