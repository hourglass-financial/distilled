> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Pagination

List endpoints use cursor pagination. Use it to fetch large result sets in predictable chunks.

## Request fields

| Field            | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| `page_size`      | Number of items to return. Defaults to 25. Maximum is 100.               |
| `starting_after` | Return the page after this object ID. Use this for forward pagination.   |
| `ending_before`  | Return the page before this object ID. Use this for backward pagination. |

## Response fields

List responses include the page of objects and links for the adjacent pages.

| Field       | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| `data`      | Objects in the current page.                                                  |
| `has_more`  | Whether the response indicates more results beyond this page.                 |
| `page_size` | Requested page size. The last page may contain fewer objects than this value. |
| `page_next` | URL for the next page, or `null`.                                             |
| `page_prev` | URL for the previous page, or `null`.                                         |
| `url`       | URL for the current page.                                                     |

```json
{
  "data": [
    { "id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd" }
  ],
  "has_more": true,
  "page_size": 1,
  "page_next": "https://api.erebor.bank/deposit_accounts?starting_after=dep_acct_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null,
  "url": "https://api.erebor.bank/deposit_accounts?page_size=1"
}
```

`page_next` and `page_prev` are full URLs. Prefer following them directly when you do not need to modify the next request.

## Forward pagination

Start with `page_size`. If `page_next` is present, request it to fetch the next page.

```bash
curl -X GET "https://api.erebor.bank/deposit_accounts?page_size=25" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```

Or pass the last object ID from the previous page as `starting_after`:

```bash
curl -X GET "https://api.erebor.bank/deposit_accounts?page_size=25&starting_after=dep_acct_01kasd1tthf1ns1pjn1kncctwd" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```

## Backward pagination

Use `ending_before` to fetch the page before an object ID, or follow `page_prev` when it is present.

```bash
curl -X GET "https://api.erebor.bank/deposit_accounts?page_size=25&ending_before=dep_acct_01kasd2tthf1ns1pjn1knddtxe" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```