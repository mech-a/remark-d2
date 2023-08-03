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

```d2
1->2->3
```

## Another d2 code block

This should be rendered as item 1:

```d2
happiness->discovery
```

## A copy of the previous block

This should be rendered as item 2, even though it's the same as item 1:

```d2
happiness->discovery
```
