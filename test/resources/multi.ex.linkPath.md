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

![](/a/link/path/test/resources/multi/0.svg)

## Another d2 code block

This should be rendered as item 1:

![](/a/link/path/test/resources/multi/1.svg)

## A copy of the previous block

This should be rendered as item 2, even though it's the same as item 1:

![](/a/link/path/test/resources/multi/2.svg)
