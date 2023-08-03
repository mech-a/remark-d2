# Code Block Tests

## Non-d2 code block

We have a non-d2 code block that shouldn't be affected:

```py
x = 'hi'
```

## Non-code block test

Anything here should not be touched.

## A d2 code block

This should be rendered as item 0:

![](static/d2/test/resources/multi/0.png)

## Another d2 code block

This should be rendered as item 1:

![](static/d2/test/resources/multi/1.png)

## A copy of the previous block

This should be rendered as item 2, even though it's the same as item 1:

![](static/d2/test/resources/multi/2.png)